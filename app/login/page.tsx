"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { AuthForm } from "@/components/auth-form"
import { FlightFlyMark, ShieldGlobeIcon } from "@/components/icons"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

export default function LoginPage() {
  const { user, role, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (user) {
      router.replace(role === "admin" ? "/admin" : "/dashboard")
    }
  }, [user, role, loading, router])

  if (loading || user) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[#F8FAFC]">
        <Spinner className="size-8 text-[#1E40AF]" />
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-[#F8FAFC] px-4 py-10">
      <Link href="/" className="mb-6 flex items-center gap-2.5">
        <div className="flex size-11 items-center justify-center rounded-xl bg-[#0F172A] text-amber-400 shadow-md">
          <FlightFlyMark className="size-6" />
        </div>
        <span className="text-xl font-semibold tracking-tight text-[#0F172A]">
          FLIGHT<span className="text-[#1E40AF]">FLY</span>
        </span>
      </Link>

      <Card className="w-full max-w-md overflow-hidden rounded-2xl border-slate-200 bg-white shadow-xl">
        <div className="bg-[#0F172A] p-6 text-white text-center relative overflow-hidden">
          <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-[#1E40AF]/40 blur-2xl pointer-events-none" />
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-amber-400 mb-3 backdrop-blur-md">
            <ShieldGlobeIcon className="size-3.5" /> FlightFly Firebase VIP Pass
          </div>
          <h1 className="text-2xl font-semibold tracking-[-0.01em] text-white">
            Welcome to FlightFly
          </h1>
          <p className="mt-1 text-sm font-normal text-slate-300">
            Access exclusive member discounts &amp; priority concierge
          </p>
        </div>
        <div className="p-6">
          <AuthForm onSuccess={() => router.replace("/dashboard")} />
        </div>
      </Card>
    </div>
  )
}