"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import { Home, LogOut } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import { NotificationBell } from "@/components/dashboard/notification-bell"
import { cn } from "@/lib/utils"
import { FlightFlyMark } from "@/components/icons"

export interface DashboardNavItem {
  title: string
  url: string
  icon: LucideIcon
}

interface DashboardShellProps {
  portalLabel: string
  navGroups: { label: string; items: DashboardNavItem[] }[]
  children: React.ReactNode
}

export function DashboardShell({ portalLabel, navGroups, children }: DashboardShellProps) {
  const { user, profile, role, logout } = useAuth()
  const pathname = usePathname()

  const isActive = (url: string) => pathname === url || pathname.startsWith(`${url}/`)

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="offcanvas">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                render={<Link href="/" />}
                className="group/sidebar-brand gap-2.5"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <FlightFlyMark className="size-5" />
                </div>
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-sm font-semibold tracking-tight">
                    FLIGHT<span className="text-primary">FLY</span>
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {portalLabel}
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          {navGroups.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      render={<Link href={item.url} />}
                      isActive={isActive(item.url)}
                    >
                      <item.icon data-icon="inline-start" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter>
          <div className="flex items-center gap-2.5 rounded-lg bg-muted p-2">
            <Avatar className="size-9">
              {profile?.photoURL && <AvatarImage src={profile.photoURL} alt={profile.displayName || ""} />}
              <AvatarFallback>{profile?.displayName?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-xs font-medium">{profile?.displayName || "VIP Traveler"}</p>
              <p className="truncate text-[10px] text-muted-foreground">{user?.email}</p>
            </div>
            <Badge variant="secondary" className={cn("text-[10px] uppercase", role === "admin" && "bg-amber-500 text-slate-950")}>
              {role}
            </Badge>
          </div>
          <div className="grid gap-1">
            <SidebarMenuButton render={<Link href="/" />} size="sm">
              <Home data-icon="inline-start" />
              <span>Back to website</span>
            </SidebarMenuButton>
            <SidebarMenuButton size="sm" onClick={logout} className="text-destructive hover:text-destructive">
              <LogOut data-icon="inline-start" />
              <span>Sign out</span>
            </SidebarMenuButton>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 md:px-6">
          <SidebarTrigger className="-ml-1" />
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:inline">{user?.email}</span>
            <NotificationBell />
            <Button render={<Link href="/" />} size="sm" variant="outline">
              <Home data-icon="inline-start" />
              Home
            </Button>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}