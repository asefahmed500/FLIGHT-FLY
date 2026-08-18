"use client"

import { useEffect, useMemo, useState } from "react"
import { useCatalog, createCatalogItem, updateCatalogItem, deleteCatalogItem } from "@/lib/firestore-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { NativeSelect } from "@/components/ui/native-select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Pencil, Sticker, Ticket, MapPin, Compass, Quote, Sparkles, Tag, Flame, Star } from "lucide-react"
import { FEATURE_ICON_NAMES } from "@/lib/feature-icons"
import type { CatalogItem, CatalogKind } from "@/lib/types"

type FieldKey =
  | "title" | "subtitle" | "price" | "badge" | "rating" | "image"
  | "deal" | "originalPrice" | "country" | "reviews" | "location" | "duration" | "groupSize"
  | "role" | "verified" | "text" | "icon" | "code"

interface KindConfig {
  label: string
  icon: React.ComponentType<{ className?: string }>
  fields: FieldKey[]
  priceBadge?: boolean
  deal?: boolean
  single?: boolean
  hint: string
}

const TABS: Record<CatalogKind, KindConfig> = {
  visa: { label: "Visa Services", icon: Sticker, fields: ["title", "subtitle", "price", "badge", "rating", "image"], priceBadge: true, deal: true, hint: "Visa services shown in the landing Visa section." },
  ticket: { label: "Tickets & Events", icon: Ticket, fields: ["title", "subtitle", "price", "badge", "rating", "image"], priceBadge: true, deal: true, hint: "Event & experience tickets shown in the Tickets section." },
  destination: { label: "Destinations", icon: MapPin, fields: ["title", "country", "subtitle", "price", "badge", "rating", "reviews", "image"], priceBadge: true, deal: true, hint: "Featured destination packages shown in the Destinations carousel." },
  tour: { label: "Tours", icon: Compass, fields: ["title", "subtitle", "location", "duration", "groupSize", "price", "badge", "rating", "reviews", "image"], priceBadge: true, deal: true, hint: "Guided tours shown in the Trending Tours carousel." },
  testimonial: { label: "Testimonials", icon: Quote, fields: ["title", "role", "verified", "text", "rating", "image"], hint: "Client reviews shown in the Trusted section." },
  feature: { label: "Why Choose Us", icon: Sparkles, fields: ["title", "subtitle", "icon"], hint: "Feature cards in the Why World Travelers Trust FlightFly section." },
  promo: { label: "Promo Banner", icon: Tag, fields: ["title", "subtitle", "text", "code"], single: true, hint: "Single flash-sale banner shown under the hero. One live promo at a time." },
}

const emptyForm = {
  title: "", subtitle: "", price: "", badge: "", rating: "5.0", image: "",
  deal: false, originalPrice: "",
  country: "", reviews: "", location: "", duration: "", groupSize: "",
  role: "", verified: "", text: "", icon: "shield", code: "",
}

const FIELD_LABELS: Record<FieldKey, { label: string; placeholder: string; type?: "number" | "textarea" }> = {
  title: { label: "Title *", placeholder: "Schengen Area Tourist Visa" },
  subtitle: { label: "Subtitle", placeholder: "Short one-line description shown on the card" },
  price: { label: "Price *", placeholder: "$220" },
  badge: { label: "Badge", placeholder: "Approval 5-7 Days" },
  rating: { label: "Rating (1–5)", placeholder: "5.0", type: "number" },
  image: { label: "Image URL", placeholder: "https://…" },
  deal: { label: "Mark as Deal", placeholder: "" },
  originalPrice: { label: "Original price (strikethrough)", placeholder: "$280" },
  country: { label: "Country / Region", placeholder: "France" },
  reviews: { label: "Reviews label", placeholder: "1,240 reviews" },
  location: { label: "Location", placeholder: "Dubai, UAE" },
  duration: { label: "Duration", placeholder: "6 Hours" },
  groupSize: { label: "Group size", placeholder: "Max 8 People" },
  role: { label: "Role / Title", placeholder: "VP of Marketing, TechScale" },
  verified: { label: "Verified label", placeholder: "Verified Corporate Account" },
  text: { label: "Testimonial / Banner copy", placeholder: "Write the quote or promo message…", type: "textarea" },
  icon: { label: "Icon", placeholder: "" },
  code: { label: "Promo code", placeholder: "FLYGOLD45" },
}

export default function AdminCrmPage() {
  const { catalog, loading } = useCatalog()
  const [tab, setTab] = useState<CatalogKind>("visa")
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const config = TABS[tab]
  const items = useMemo(
    () => catalog.filter((c) => c.kind === tab).sort((a, b) => (a.badge || "").localeCompare(b.badge || "")),
    [catalog, tab]
  )
  const promoItem = useMemo(() => catalog.find((c) => c.kind === "promo") || null, [catalog])

  // Prefill promo single-doc editor when it loads.
  useEffect(() => {
    if (tab === "promo" && promoItem && !editingId) {
      const t = setTimeout(() => {
        setForm({
          ...emptyForm,
          title: promoItem.title || "",
          subtitle: promoItem.subtitle || "",
          text: promoItem.text || "",
          code: promoItem.code || "",
        })
      }, 0)
      return () => clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, promoItem])

  const set = (key: FieldKey) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const switchTab = (next: string) => {
    setTab(next as CatalogKind)
    setEditingId(null)
    setForm(emptyForm)
    setError("")
  }

  const startEdit = (item: CatalogItem) => {
    setEditingId(item.id)
    setError("")
    setForm({
      title: item.title || "",
      subtitle: item.subtitle || "",
      price: item.price || "",
      badge: item.badge || "",
      rating: String(item.rating ?? 5),
      image: item.image || "",
      deal: !!item.deal,
      originalPrice: item.originalPrice || "",
      country: item.country || "",
      reviews: item.reviews || "",
      location: item.location || "",
      duration: item.duration || "",
      groupSize: item.groupSize || "",
      role: item.role || "",
      verified: item.verified || "",
      text: item.text || "",
      icon: item.icon || "shield",
      code: item.code || "",
    })
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!form.title.trim() || (config.priceBadge && !form.price.trim())) {
      setError("Title and price are required.")
      return
    }
    const base = {
      kind: tab,
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      price: form.price.trim(),
      badge: form.badge.trim() || (tab === "visa" ? "Approval 5-7 Days" : tab === "ticket" ? "PREMIUM" : "Featured"),
      rating: Math.min(5, Math.max(1, Number(form.rating) || 5)),
      image: form.image.trim(),
      deal: form.deal || undefined,
      originalPrice: form.originalPrice.trim() || undefined,
      country: form.country.trim() || undefined,
      reviews: form.reviews.trim() || undefined,
      location: form.location.trim() || undefined,
      duration: form.duration.trim() || undefined,
      groupSize: form.groupSize.trim() || undefined,
      role: form.role.trim() || undefined,
      verified: form.verified.trim() || undefined,
      text: form.text.trim() || undefined,
      icon: form.icon || undefined,
      code: form.code.trim() || undefined,
    }
    setSubmitting(true)
    try {
      if (tab === "promo") {
        if (promoItem) await updateCatalogItem(promoItem.id, { ...base, kind: "promo" })
        else await createCatalogItem({ ...base, kind: "promo" })
      } else if (editingId) {
        await updateCatalogItem(editingId, base)
      } else {
        await createCatalogItem(base)
      }
      setForm(emptyForm)
      setEditingId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save content.")
    } finally {
      setSubmitting(false)
    }
  }

  const remove = async (item: CatalogItem) => {
    if (!window.confirm(`Delete "${item.title}"?`)) return
    setError("")
    try {
      await deleteCatalogItem(item.id)
      if (editingId === item.id) {
        setEditingId(null)
        setForm(emptyForm)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete content.")
    }
  }

  const showFields = config.fields

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.01em]">Content CRM</h1>
        <p className="text-sm text-muted-foreground">
          Edit every piece of content on the website from here. Changes publish instantly to the landing page.
        </p>
      </div>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-600">{error}</div>}

      <Tabs value={tab} onValueChange={switchTab} className="w-full">
        <TabsList className="flex w-full flex-wrap justify-start gap-1 bg-slate-200/70 p-1">
          {(Object.keys(TABS) as CatalogKind[]).map((kind) => {
            const T = TABS[kind]
            const TIcon = T.icon
            return (
              <TabsTrigger key={kind} value={kind} className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#111111]">
                <TIcon className="mr-1.5 size-3.5" /> {T.label}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {(Object.keys(TABS) as CatalogKind[]).map((kind) => {
          const T = TABS[kind]
          return (
            <TabsContent key={kind} value={kind} className="flex flex-col gap-6">
              <Card className="rounded-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <T.icon className="size-4 text-[#4F46E5]" /> {T.single ? "Edit Promo Banner" : editingId && kind === tab ? "Edit Content" : `Create ${T.label.replace(/s$/, "")}`}
                  </CardTitle>
                  <CardDescription>{T.hint}</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={submit} className="flex flex-col gap-4">
                    <FieldGroup>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {showFields.includes("title") && (
                          <Field>
                            <FieldLabel htmlFor={`${kind}-title`}>{FIELD_LABELS.title.label}</FieldLabel>
                            <Input id={`${kind}-title`} value={form.title} onChange={set("title")} placeholder={FIELD_LABELS.title.placeholder} />
                          </Field>
                        )}
                        {showFields.includes("country") && (
                          <Field>
                            <FieldLabel htmlFor={`${kind}-country`}>{FIELD_LABELS.country.label}</FieldLabel>
                            <Input id={`${kind}-country`} value={form.country} onChange={set("country")} placeholder={FIELD_LABELS.country.placeholder} />
                          </Field>
                        )}
                        {showFields.includes("role") && (
                          <Field>
                            <FieldLabel htmlFor={`${kind}-role`}>{FIELD_LABELS.role.label}</FieldLabel>
                            <Input id={`${kind}-role`} value={form.role} onChange={set("role")} placeholder={FIELD_LABELS.role.placeholder} />
                          </Field>
                        )}
                        {showFields.includes("verified") && (
                          <Field>
                            <FieldLabel htmlFor={`${kind}-verified`}>{FIELD_LABELS.verified.label}</FieldLabel>
                            <Input id={`${kind}-verified`} value={form.verified} onChange={set("verified")} placeholder={FIELD_LABELS.verified.placeholder} />
                          </Field>
                        )}
                        {showFields.includes("code") && (
                          <Field>
                            <FieldLabel htmlFor={`${kind}-code`}>{FIELD_LABELS.code.label}</FieldLabel>
                            <Input id={`${kind}-code`} value={form.code} onChange={set("code")} placeholder={FIELD_LABELS.code.placeholder} />
                          </Field>
                        )}
                        {showFields.includes("icon") && (
                          <Field>
                            <FieldLabel htmlFor={`${kind}-icon`}>{FIELD_LABELS.icon.label}</FieldLabel>
                            <NativeSelect id={`${kind}-icon`} value={form.icon} onChange={set("icon")}>
                              {FEATURE_ICON_NAMES.map((name) => (
                                <option key={name} value={name}>
                                  {name}
                                </option>
                              ))}
                            </NativeSelect>
                          </Field>
                        )}
                        {showFields.includes("rating") && (
                          <Field>
                            <FieldLabel htmlFor={`${kind}-rating`}>{FIELD_LABELS.rating.label}</FieldLabel>
                            <Input id={`${kind}-rating`} type="number" min={1} max={5} step={0.1} value={form.rating} onChange={set("rating")} />
                          </Field>
                        )}
                        {showFields.includes("price") && (
                          <Field>
                            <FieldLabel htmlFor={`${kind}-price`}>{FIELD_LABELS.price.label}</FieldLabel>
                            <Input id={`${kind}-price`} value={form.price} onChange={set("price")} placeholder={FIELD_LABELS.price.placeholder} />
                          </Field>
                        )}
                        {showFields.includes("badge") && (
                          <Field>
                            <FieldLabel htmlFor={`${kind}-badge`}>{FIELD_LABELS.badge.label}</FieldLabel>
                            <Input id={`${kind}-badge`} value={form.badge} onChange={set("badge")} placeholder={FIELD_LABELS.badge.placeholder} />
                          </Field>
                        )}
                        {showFields.includes("duration") && (
                          <Field>
                            <FieldLabel htmlFor={`${kind}-duration`}>{FIELD_LABELS.duration.label}</FieldLabel>
                            <Input id={`${kind}-duration`} value={form.duration} onChange={set("duration")} placeholder={FIELD_LABELS.duration.placeholder} />
                          </Field>
                        )}
                        {showFields.includes("groupSize") && (
                          <Field>
                            <FieldLabel htmlFor={`${kind}-group`}>{FIELD_LABELS.groupSize.label}</FieldLabel>
                            <Input id={`${kind}-group`} value={form.groupSize} onChange={set("groupSize")} placeholder={FIELD_LABELS.groupSize.placeholder} />
                          </Field>
                        )}
                        {showFields.includes("location") && (
                          <Field>
                            <FieldLabel htmlFor={`${kind}-location`}>{FIELD_LABELS.location.label}</FieldLabel>
                            <Input id={`${kind}-location`} value={form.location} onChange={set("location")} placeholder={FIELD_LABELS.location.placeholder} />
                          </Field>
                        )}
                        {showFields.includes("reviews") && (
                          <Field>
                            <FieldLabel htmlFor={`${kind}-reviews`}>{FIELD_LABELS.reviews.label}</FieldLabel>
                            <Input id={`${kind}-reviews`} value={form.reviews} onChange={set("reviews")} placeholder={FIELD_LABELS.reviews.placeholder} />
                          </Field>
                        )}
                      </div>

                      {showFields.includes("subtitle") && (
                        <Field>
                          <FieldLabel htmlFor={`${kind}-subtitle`}>{FIELD_LABELS.subtitle.label}</FieldLabel>
                          <Input id={`${kind}-subtitle`} value={form.subtitle} onChange={set("subtitle")} placeholder={FIELD_LABELS.subtitle.placeholder} />
                        </Field>
                      )}

                      {showFields.includes("text") && (
                        <Field>
                          <FieldLabel htmlFor={`${kind}-text`}>{FIELD_LABELS.text.label}</FieldLabel>
                          <Textarea id={`${kind}-text`} rows={4} value={form.text} onChange={set("text")} placeholder={FIELD_LABELS.text.placeholder} />
                        </Field>
                      )}

                      {showFields.includes("image") && (
                        <Field>
                          <FieldLabel htmlFor={`${kind}-image`}>{FIELD_LABELS.image.label}</FieldLabel>
                          <Input id={`${kind}-image`} value={form.image} onChange={set("image")} placeholder={FIELD_LABELS.image.placeholder} />
                          <FieldDescription>Optional; leave blank to show a branded placeholder.</FieldDescription>
                        </Field>
                      )}

                      {T.deal && (
                        <div className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium">Mark as Deal</p>
                              <p className="text-xs text-muted-foreground">Shows an amber DEAL chip and strikethrough price.</p>
                            </div>
                            <Switch checked={form.deal} onCheckedChange={(c) => setForm((f) => ({ ...f, deal: c }))} />
                          </div>
                          {form.deal && (
                            <Field>
                              <FieldLabel htmlFor={`${kind}-orig`}>{FIELD_LABELS.originalPrice.label}</FieldLabel>
                              <Input id={`${kind}-orig`} value={form.originalPrice} onChange={set("originalPrice")} placeholder={FIELD_LABELS.originalPrice.placeholder} />
                            </Field>
                          )}
                        </div>
                      )}
                    </FieldGroup>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={submitting}>
                        <Plus className="size-4" data-icon="inline-start" /> {submitting ? "Saving…" : editingId && kind === tab ? "Save Changes" : T.single ? "Publish Promo" : "Publish Item"}
                      </Button>
                      {editingId && kind === tab && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditingId(null)
                            setForm(emptyForm)
                          }}
                        >
                          Cancel edit
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              {!T.single && (
                <Card className="rounded-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <T.icon className="size-4 text-amber-500" /> Published {T.label}
                    </CardTitle>
                    <CardDescription>{loading ? "Syncing…" : `${items.length} live`}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <Skeleton className="h-12 w-full" />
                    ) : items.length === 0 ? (
                      <p className="py-6 text-center text-sm text-muted-foreground">Nothing published yet.</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead>Item</TableHead>
                            <TableHead>Badge</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <p className="flex items-center gap-2 font-medium">
                                  {item.title}
                                  {item.deal && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                      <Flame className="size-3" /> DEAL
                                    </span>
                                  )}
                                </p>
                                {item.country && <p className="text-xs text-muted-foreground">{item.country}</p>}
                              </TableCell>
                              <TableCell>
                                {item.badge ? (
                                  <span className="text-xs font-medium text-amber-600">{item.badge}</span>
                                ) : (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {item.price ? (
                                  <span className="font-semibold text-emerald-600">
                                    {item.price}
                                    {item.originalPrice && <span className="ml-1.5 text-xs font-normal text-muted-foreground line-through">{item.originalPrice}</span>}
                                  </span>
                                ) : (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                                {item.rating > 0 && (
                                  <span className="ml-2 inline-flex items-center gap-0.5 text-xs font-medium text-amber-500">
                                    <Star className="size-3 fill-amber-400 stroke-amber-400" /> {item.rating}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button size="icon-sm" variant="ghost" aria-label={`Edit ${item.title}`} onClick={() => startEdit(item)}>
                                    <Pencil />
                                  </Button>
                                  <Button size="icon-sm" variant="ghost" aria-label={`Delete ${item.title}`} onClick={() => remove(item)} className="text-muted-foreground hover:text-destructive">
                                    <Trash2 />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              )}

              {T.single && (
                <Card className="rounded-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Tag className="size-4 text-amber-500" /> Live Promo
                    </CardTitle>
                    <CardDescription>
                      {promoItem ? `${promoItem.title || "Promo"} — code ${promoItem.code || "—"}` : "No promo published yet — the default banner shows."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary" className="text-xs">
                      One banner, live site-wide below the hero. Save to publish or update.
                    </Badge>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}