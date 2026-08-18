"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/lib/auth-context"
import { Plane, Globe, ChevronDown, Menu, User, PhoneCall, Sparkles, ShieldCheck, LayoutDashboard, LogOut } from "lucide-react"
import { FlightFlyMark } from "@/components/icons"

const NAV_LINKS = [
  { label: "Flights", href: "/flights" },
  { label: "Hotels", href: "/hotels" },
  { label: "Tours", href: "/tours" },
  { label: "Packages", href: "/packages" },
  { label: "Visa", href: "/visa" },
  { label: "Tickets", href: "/tickets" },
  { label: "Deals", href: "/deals", hot: true },
]

function isLinkActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function Navbar() {
  const { user, role, logout } = useAuth()
  const pathname = usePathname()
  const [currency, setCurrency] = useState("USD ($)")
  const [language, setLanguage] = useState("English (US)")

  const dashboardHref = role === "admin" ? "/admin" : "/dashboard"

  return (
    <div className="sticky top-0 z-50">
      {/* Top banner strip (sticky, full width) */}
      <div className="bg-[#111111] text-slate-300 text-xs py-2 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> Official IATA & ATOL Accredited Agency
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-slate-400 font-normal">
              <PhoneCall className="w-3 h-3 text-slate-400" /> 24/7 Corporate Concierge: <strong className="text-slate-200 ml-1 font-semibold">+1 (800) 555-FLYFLY</strong>
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-300">
            {/* Currency Switcher Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger>
                <div className="hover:text-white flex items-center gap-1 transition-colors cursor-pointer outline-none font-medium">
                  <span>{currency}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white text-slate-900 border-slate-200 shadow-xl z-50 min-w-48 p-1.5">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs font-semibold text-slate-500 px-2 py-1">Select Currency</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <DropdownMenuItem onClick={() => setCurrency("USD ($)")} className="cursor-pointer text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md font-medium text-xs py-2">USD ($) - US Dollar</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCurrency("EUR (€)")} className="cursor-pointer text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md font-medium text-xs py-2">EUR (€) - Euro</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCurrency("GBP (£)")} className="cursor-pointer text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md font-medium text-xs py-2">GBP (£) - British Pound</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCurrency("AED (د.إ)")} className="cursor-pointer text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md font-medium text-xs py-2">AED (د.إ) - UAE Dirham</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCurrency("JPY (¥)")} className="cursor-pointer text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md font-medium text-xs py-2">JPY (¥) - Japanese Yen</DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <span className="text-slate-700">|</span>

            {/* Language Switcher Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger>
                <div className="hover:text-white flex items-center gap-1 transition-colors cursor-pointer outline-none font-medium">
                  <Globe className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language.split(" ")[0]}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white text-slate-900 border-slate-200 shadow-xl z-50 min-w-44 p-1.5">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs font-semibold text-slate-500 px-2 py-1">Select Language</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <DropdownMenuItem onClick={() => setLanguage("English (US)")} className="cursor-pointer text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md font-medium text-xs py-2">English (US)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage("Français")} className="cursor-pointer text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md font-medium text-xs py-2">Français</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage("Deutsch")} className="cursor-pointer text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md font-medium text-xs py-2">Deutsch</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage("Español")} className="cursor-pointer text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md font-medium text-xs py-2">Español</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage("العربية")} className="cursor-pointer text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md font-medium text-xs py-2">العربية</DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Floating rounded pill navbar, detached below the banner */}
      <div className="mx-auto max-w-6xl px-3 pt-3 pb-1 sm:px-6">
        <header className="rounded-lg border border-slate-200/80 bg-white/90 shadow-lg shadow-slate-900/5 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between gap-3 px-3 sm:h-[4.25rem] sm:px-5">
            {/* Logo */}
            <Link href="/" className="group flex shrink-0 items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#111111] text-amber-400 shadow-md transition-colors group-hover:bg-[#4F46E5]">
                <FlightFlyMark className="h-5 w-5 transition-transform group-hover:scale-110" />
              </div>
              <div className="hidden sm:flex sm:flex-col">
                <span className="flex items-center gap-1 text-lg font-semibold leading-tight tracking-tight text-[#111111]">
                  FLIGHT<span className="text-[#4F46E5]">FLY</span>
                  <span className="h-2 w-2 rounded-full bg-[#D97706]"></span>
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-widest text-slate-400">Corporate Luxury Travel</span>
              </div>
            </Link>

            {/* Main Menu Links (visible from md) */}
            <nav className="hidden items-center gap-1 overflow-x-auto whitespace-nowrap md:flex md:flex-1 md:justify-center lg:gap-5">
              {NAV_LINKS.map((link) => {
                const isActive = isLinkActive(pathname, link.href)
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`u-draw px-2.5 py-2 text-[12.5px] font-medium transition-colors lg:text-sm ${
                      isActive ? "text-[#4F46E5]" : "text-[#111111] hover:text-[#4F46E5]"
                    }`}
                  >
                    {link.label}
                    {link.hot && (
                      <span className="ml-1 rounded-full border border-amber-200 bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold text-[#D97706]">
                        HOT
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Right Action Buttons (Sign Up VIP removed) */}
            <div className="hidden items-center gap-2 md:flex">
              {user ? (
                <div className="flex items-center gap-2">
                  <Button render={<Link href={dashboardHref} />} className="flex h-10 items-center gap-2 rounded-xl bg-[#4F46E5] px-3 text-xs font-semibold text-white shadow-md transition-all hover:bg-[#111111] sm:px-4 sm:text-sm">
                    <LayoutDashboard className="h-4 w-4 text-amber-300" />
                    <span className="hidden sm:inline">{role === "admin" ? "Admin Dashboard" : "User Dashboard"}</span>
                  </Button>
                  <Button variant="ghost" onClick={logout} aria-label="Log out" className="h-10 px-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button render={<Link href="/login?tab=login" />} variant="ghost" className="h-10 px-3 text-sm font-medium text-[#111111] hover:bg-slate-100 hover:text-[#4F46E5]">
                  <User className="mr-1.5 h-4 w-4 text-slate-500" /> Login
                </Button>
              )}
            </div>

            {/* Mobile Sheet Menu Trigger (below md) */}
            <div className="flex items-center gap-2 md:hidden">
              <Sheet>
                <SheetTrigger>
                  <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50">
                    <Menu className="h-5 w-5 text-[#111111]" />
                  </div>
                </SheetTrigger>
                <SheetContent side="right" className="flex flex-col justify-between border-slate-200 bg-white p-6">
                  <div>
                    <SheetHeader className="mb-6 text-left">
                      <SheetTitle className="flex items-center gap-2 text-xl font-semibold text-[#111111]">
                        <Plane className="h-5 w-5 text-[#4F46E5]" /> FLIGHTFLY
                      </SheetTitle>
                    </SheetHeader>

                    <nav className="flex flex-col gap-4 text-base font-medium text-[#111111]">
                      {NAV_LINKS.map((link) => (
                        <Link
                          key={link.label}
                          href={link.href}
                          className={`flex items-center justify-between border-b border-slate-100 py-2 transition-colors hover:text-[#4F46E5] ${
                            isLinkActive(pathname, link.href) ? "text-[#4F46E5]" : ""
                          }`}
                        >
                          {link.label}
                          {link.hot && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-[#D97706]">HOT</span>}
                        </Link>
                      ))}
                    </nav>
                  </div>

                  <div className="space-y-3 border-t border-slate-200 pt-6">
                    {user ? (
                      <Button render={<Link href={dashboardHref} />} className="h-11 w-full bg-[#4F46E5] font-medium text-white">
                        <Sparkles className="mr-2 h-4 w-4 text-amber-300" /> Open Dashboard ({role})
                      </Button>
                    ) : (
                      <Button render={<Link href="/login?tab=login" />} variant="outline" className="h-11 w-full border-slate-300 font-medium">
                        <User className="mr-2 h-4 w-4" /> Login to Account
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>
      </div>
    </div>
  )
}