"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useMyBookings } from "@/lib/app-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToastStore } from "@/lib/stores/toast-store"
import { ShieldCheck, Mail, KeyRound, Plane, CheckCheck, Loader2 } from "lucide-react"

export default function DashboardProfilePage() {
  const { user, profile, role } = useAuth()
  const { bookings } = useMyBookings(user)
  const pushToast = useToastStore((s) => s.push)
  const [name, setName] = useState(profile?.displayName ?? "")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const saveName = async () => {
    if (!user || !name.trim() || saving) return
    setSaving(true)
    try {
      await updateDoc(doc(db, "users", user.uid), { displayName: name.trim() })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      pushToast({
        variant: "success",
        title: "Profile updated",
        description: "Your display name has been saved.",
      })
    } catch {
      pushToast({
        variant: "error",
        title: "Update failed",
        description: "Could not save your display name. Please try again.",
      })
    } finally {
      setSaving(false)
    }
  }

  const approvedCount = bookings.filter((b) => b.status === "approved").length
  const pendingCount = bookings.filter((b) => b.status === "pending").length

  const stats = [
    { icon: Plane, label: "Total Reservations", value: String(bookings.length) },
    { icon: CheckCheck, label: "Approved", value: String(approvedCount) },
    { icon: KeyRound, label: "Pending Review", value: String(pendingCount) },
  ]

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.01em]">Account &amp; Security Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile and review your role-based access.</p>
      </div>

      {/* Identity header card */}
      <Card className="rounded-xl">
        <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
          <Avatar className="size-16">
            {profile?.photoURL && <AvatarImage src={profile.photoURL} alt={profile.displayName || ""} />}
            <AvatarFallback className="text-xl font-semibold">
              {profile?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold tracking-[-0.01em]">
                {profile?.displayName || user?.email?.split("@")[0] || "VIP Traveler"}
              </h2>
              <Badge className={role === "admin" ? "bg-amber-500 text-slate-950 uppercase" : "bg-[#1E40AF] text-white uppercase"}>
                <ShieldCheck data-icon="inline-start" /> {role}
              </Badge>
            </div>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mail className="size-3.5" /> {user?.email}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:w-72">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1 rounded-xl bg-muted/60 px-3 py-3 text-center">
                <s.icon className="size-4 text-[#1E40AF]" />
                <span className="text-lg font-semibold leading-none">{s.value}</span>
                <span className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Profile form */}
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your display name — synced to Firestore instantly.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="display-name">Display Name</FieldLabel>
              <Input
                id="display-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Asef Ahmed"
                className="max-w-sm"
              />
              <FieldDescription>
                This name appears on your dashboard, bookings and e-tickets.
              </FieldDescription>
            </Field>
          </FieldGroup>
          <Separator className="my-5" />
          <div className="flex items-center gap-3">
            <Button onClick={saveName} disabled={saving || !name.trim()} className="bg-[#1E40AF] hover:bg-[#0F172A]">
              {saving ? (
                <>
                  <Loader2 className="animate-spin" data-icon="inline-start" /> Saving…
                </>
              ) : saved ? (
                <>
                  <CheckCheck data-icon="inline-start" /> Saved
                </>
              ) : (
                "Save changes"
              )}
            </Button>
            {saved && <span className="text-xs font-medium text-emerald-600">Profile updated successfully.</span>}
          </div>
        </CardContent>
      </Card>

      {/* Security details */}
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>Security Details</CardTitle>
          <CardDescription>Managed by Firebase Authentication &amp; Firestore rules.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted/60 px-4 py-3">
            <span className="flex items-center gap-2 text-muted-foreground">
              <KeyRound className="size-3.5" /> Firebase UID
            </span>
            <span className="font-mono text-xs">{user?.uid}</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted/60 px-4 py-3">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Mail className="size-3.5" /> Registered Email
            </span>
            <span className="font-semibold">{user?.email}</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted/60 px-4 py-3">
            <span className="flex items-center gap-2 text-muted-foreground">
              <ShieldCheck className="size-3.5" /> Role Privilege
            </span>
            <Badge variant="secondary" className="uppercase">{role}</Badge>
          </div>
          <p className="px-1 text-xs text-muted-foreground">
            Roles are assigned from the admin allowlist and the PostgreSQL user record. Non-admin users cannot change their own role.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}