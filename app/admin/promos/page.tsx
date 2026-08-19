"use client"

import { useCallback, useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { TicketPercent, Plus, Loader2 } from "lucide-react"
import type { PromoCodeInfo } from "@/lib/types"

async function api<T>(path: string, user: { getIdToken: () => Promise<string> }, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await user.getIdToken()}`,
      ...init?.headers,
    },
    cache: "no-store",
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`)
  return data as T
}

export default function AdminPromosPage() {
  const { user } = useAuth()
  const [promos, setPromos] = useState<PromoCodeInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [creating, setCreating] = useState(false)

  const [code, setCode] = useState("")
  const [percent, setPercent] = useState("10")
  const [description, setDescription] = useState("")
  const [expiresAt, setExpiresAt] = useState("")

  const load = useCallback(async () => {
    if (!user) return
    try {
      const rows = await api<PromoCodeInfo[]>("/api/promos", user)
      setPromos(rows)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load promos.")
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    const t = setTimeout(() => load(), 0)
    return () => clearTimeout(t)
  }, [load])

  const create = async () => {
    if (!user || creating) return
    setError("")
    const percentNum = Number(percent)
    if (!/^[A-Za-z0-9]{3,24}$/.test(code.trim())) {
      setError("Code must be 3-24 letters/digits.")
      return
    }
    if (!Number.isInteger(percentNum) || percentNum < 1 || percentNum > 90) {
      setError("Percent off must be a whole number between 1 and 90.")
      return
    }
    setCreating(true)
    try {
      await api("/api/promos", user, {
        method: "POST",
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          percentOff: percentNum,
          description: description.trim() || null,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        }),
      })
      setCode("")
      setPercent("10")
      setDescription("")
      setExpiresAt("")
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create promo.")
    } finally {
      setCreating(false)
    }
  }

  const toggle = async (p: PromoCodeInfo) => {
    if (!user) return
    try {
      await api("/api/promos", user, { method: "PATCH", body: JSON.stringify({ id: p.id, active: !p.active }) })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update promo.")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Badge className="mb-2 bg-[#4F46E5] font-semibold text-white">POSTGRES · PROMO CODES</Badge>
        <h1 className="text-2xl font-semibold tracking-[-0.01em]">Promo Code Manager</h1>
        <p className="text-sm text-muted-foreground">
          Codes validated server-side at checkout — usage counts and pricing apply automatically.
        </p>
      </div>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-600">{error}</div>}

      {/* Create form */}
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="size-4 text-[#4F46E5]" /> Create / Update Code
          </CardTitle>
          <CardDescription>Upserts by code — creating an existing code updates its discount.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field>
                <FieldLabel htmlFor="promo-code">Code</FieldLabel>
                <Input
                  id="promo-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="SUMMER25"
                  className="font-mono uppercase"
                />
                <FieldDescription>3–24 letters or digits.</FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="promo-percent">Percent Off</FieldLabel>
                <Input
                  id="promo-percent"
                  type="number"
                  min={1}
                  max={90}
                  value={percent}
                  onChange={(e) => setPercent(e.target.value)}
                />
                <FieldDescription>Whole number, 1–90.</FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="promo-desc">Description</FieldLabel>
                <Input
                  id="promo-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summer flash sale"
                />
              </Field>
            </div>
            <Field className="mt-4 max-w-sm">
              <FieldLabel htmlFor="promo-expires">Expires (optional)</FieldLabel>
              <Input
                id="promo-expires"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
              <FieldDescription>
                Leave blank for no expiry. The homepage banner countdown only shows when a code has one.
              </FieldDescription>
            </Field>
          </FieldGroup>
          <Button onClick={create} disabled={creating || !code.trim()} className="mt-4 bg-[#4F46E5] hover:bg-[#111111]">
            {creating ? (
              <>
                <Loader2 className="animate-spin" data-icon="inline-start" /> Saving…
              </>
            ) : (
              <>
                <TicketPercent data-icon="inline-start" /> Save Code
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Live table */}
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>Active Codes</CardTitle>
          <CardDescription>{loading ? "Syncing…" : `${promos.length} code(s) in PostgreSQL`}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : promos.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No promo codes yet — create one above or run <code className="rounded bg-muted px-1">node scripts/seed-promos.mjs</code>.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Used</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promos.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs font-bold text-[#4F46E5]">{p.code}</TableCell>
                    <TableCell className="font-semibold text-emerald-600">-{p.percentOff}%</TableCell>
                    <TableCell className="max-w-[24ch] truncate text-xs text-muted-foreground">
                      {p.description ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {p.expiresAt
                        ? p.expiresAt < new Date().toISOString()
                          ? <span className="font-medium text-rose-600">Expired</span>
                          : new Date(p.expiresAt).toLocaleDateString()
                        : "Never"}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">{p.usageCount}×</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch checked={p.active} onCheckedChange={() => toggle(p)} aria-label={`Toggle ${p.code}`} />
                        <span className={p.active ? "text-xs font-medium text-emerald-600" : "text-xs font-medium text-slate-400"}>
                          {p.active ? "Active" : "Paused"}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}