"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { LayoutDashboard, Ticket, QrCode, Heart, User } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Spinner } from "@/components/ui/spinner"

const NAV_GROUPS = [
  {
    label: "Your Portal",
    items: [
      { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
      { title: "My Reservations", url: "/dashboard/bookings", icon: Ticket },
      { title: "Digital Passes & QR", url: "/dashboard/passes", icon: QrCode },
      { title: "Saved Wishlist", url: "/dashboard/favorites", icon: Heart },
      { title: "Profile Settings", url: "/dashboard/profile", icon: User },
    ],
  },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user) router.replace("/login")
    else if (isAdmin) router.replace("/admin")
  }, [user, isAdmin, loading, router])

  if (loading || !user) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[#F8FAFC]">
        <Spinner className="size-8 text-[#1E40AF]" />
      </div>
    )
  }

  return (
    <DashboardShell portalLabel="Customer Portal" navGroups={NAV_GROUPS}>
      {children}
    </DashboardShell>
  )
}