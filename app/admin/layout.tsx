"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { TrendingUp, FileText, Users, Tag, ShieldCheck, LayoutGrid } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Spinner } from "@/components/ui/spinner"

const NAV_GROUPS = [
  {
    label: "Executive Control",
    items: [
      { title: "Revenue & Analytics", url: "/admin", icon: TrendingUp },
      { title: "Manage Reservations", url: "/admin/bookings", icon: FileText },
      { title: "User Role Manager", url: "/admin/users", icon: Users },
      { title: "Deals Manager", url: "/admin/deals", icon: Tag },
      { title: "Content CRM", url: "/admin/crm", icon: LayoutGrid },
      { title: "Security Rules", url: "/admin/security", icon: ShieldCheck },
    ],
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user) router.replace("/login")
    else if (!isAdmin) router.replace("/dashboard")
  }, [user, isAdmin, loading, router])

  if (loading || !user || !isAdmin) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[#F8FAFC]">
        <Spinner className="size-8 text-[#1E40AF]" />
      </div>
    )
  }

  return (
    <DashboardShell portalLabel="Admin Portal" navGroups={NAV_GROUPS}>
      {children}
    </DashboardShell>
  )
}