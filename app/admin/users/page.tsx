"use client"

import { useMemo, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useUsers } from "@/lib/app-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ShieldCheck, ShieldOff, Search, Users as UsersIcon, Crown, User as UserIcon } from "lucide-react"
import { DataErrorBanner } from "@/components/data-error-banner"
import type { UserRole } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

export default function AdminUsersPage() {
  const { user, updateUserRole } = useAuth()
  const { users, loading, error: loadError, refresh } = useUsers(user)
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all")
  const [query, setQuery] = useState("")
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState("")

  const adminCount = useMemo(() => users.filter((u) => u.role === "admin").length, [users])

  const visible = useMemo(() => {
    let list = users
    if (roleFilter !== "all") list = list.filter((u) => u.role === roleFilter)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (u) =>
          (u.displayName || "").toLowerCase().includes(q) ||
          (u.email || "").toLowerCase().includes(q)
      )
    }
    return list
  }, [users, roleFilter, query])

  const setRole = async (uid: string, role: UserRole) => {
    if (uid === user?.uid && role === "customer") {
      setError("You cannot demote your own admin account.")
      return
    }
    setBusy(uid)
    setError("")
    try {
      await updateUserRole(uid, role)
      refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role.")
    } finally {
      setBusy(null)
    }
  }

  const roleChips = [
    { key: "all" as const, label: "All", icon: UsersIcon },
    { key: "admin" as const, label: "Admin", icon: Crown },
    { key: "customer" as const, label: "Customer", icon: UserIcon },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Badge className="mb-2 bg-amber-500 font-semibold text-slate-950">PRISMA · POSTGRESQL</Badge>
        <h1 className="text-2xl font-semibold tracking-[-0.01em]">User &amp; Privilege Manager</h1>
        <p className="text-sm text-muted-foreground">
          Grant or revoke admin access in the PostgreSQL database via Prisma (keyed by Firebase UID).
        </p>
      </div>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-600">{error}</div>}

      <DataErrorBanner error={loadError} onRetry={refresh} context="users" />

      <div className="flex flex-wrap gap-2">
        {roleChips.map((chip) => (
          <button
            key={chip.key}
            onClick={() => setRoleFilter(chip.key)}
            className={cn(
              "flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all",
              roleFilter === chip.key
                ? "border-amber-500 bg-amber-500 text-white shadow-md"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            )}
          >
            <chip.icon className="size-3.5" />
            <span className="capitalize">{chip.label}</span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                roleFilter === chip.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
              )}
            >
              {chip.key === "all" ? users.length : chip.key === "admin" ? adminCount : users.length - adminCount}
            </span>
          </button>
        ))}
      </div>

      <Card className="rounded-xl">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="size-4 text-amber-500" /> Accounts
            </CardTitle>
            <CardDescription>{loading ? "Syncing…" : `${visible.length} account(s)`}</CardDescription>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or email…" className="h-10 pl-9" />
          </div>
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
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">
                      {u.displayName || u.email?.split("@")[0]}
                      {u.id === user?.uid && <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-muted-foreground">you</span>}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <Badge className={cn("capitalize", u.role === "admin" ? "bg-amber-500 text-slate-950" : "bg-[#4F46E5] text-white")}>
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {u.role === "admin" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy === u.id || u.id === user?.uid}
                          onClick={() => setRole(u.id, "customer")}
                          className="border-amber-200 text-amber-700 hover:bg-amber-50"
                        >
                          <ShieldOff className="size-3.5" data-icon="inline-start" /> Demote
                        </Button>
                      ) : (
                        <Button size="sm" disabled={busy === u.id} onClick={() => setRole(u.id, "admin")} className="bg-[#4F46E5] hover:bg-[#111111]">
                          <ShieldCheck className="size-3.5" data-icon="inline-start" /> Promote
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {visible.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-12 text-center text-sm text-muted-foreground">
                      No users found.
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