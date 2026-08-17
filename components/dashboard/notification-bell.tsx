"use client"

import { useState } from "react"
import { Bell, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"
import { useNotifications, markNotificationsRead } from "@/lib/app-data"
import { cn } from "@/lib/utils"

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function NotificationBell() {
  const { user } = useAuth()
  const { notifications, unreadCount, refresh } = useNotifications(user)
  const [marking, setMarking] = useState(false)

  const markAll = async () => {
    if (!user || marking || unreadCount === 0) return
    setMarking(true)
    try {
      await markNotificationsRead(user, true)
      refresh()
    } finally {
      setMarking(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" aria-label={`Notifications (${unreadCount} unread)`} />
        }
      >
        <div className="relative">
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#D97706] px-1 text-[9px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2.5">
          <span className="p-0 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Notifications
          </span>
          {unreadCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                markAll()
              }}
              disabled={marking}
              className="flex items-center gap-1 text-[11px] font-medium text-[#1E40AF] hover:underline disabled:opacity-50"
            >
              <CheckCheck className="size-3" /> Mark all read
            </button>
          )}
        </div>
        <DropdownMenuSeparator className="my-0" />
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="px-3 py-8 text-center text-xs text-muted-foreground">
              No notifications yet — booking updates land here.
            </p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "border-b border-slate-100 px-3 py-2.5 last:border-0",
                  !n.read && "bg-blue-50/60"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className={cn("text-xs leading-snug", n.read ? "font-medium text-slate-700" : "font-semibold text-[#0F172A]")}>
                    {n.title}
                  </p>
                  <span className="shrink-0 text-[10px] text-slate-400">{timeAgo(n.createdAt)}</span>
                </div>
                <p className="mt-0.5 text-[11px] leading-snug text-slate-500">{n.body}</p>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}