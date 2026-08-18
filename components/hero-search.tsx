"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plane, Building2, Compass, Package, CalendarIcon, MapPin, Users, Search, Sparkles, Check } from "lucide-react"

function fmt(d: Date | undefined): string {
  return d ? d.toISOString().slice(0, 10) : ""
}

export function HeroSearch() {
  const router = useRouter()

  const [tripType, setTripType] = useState<"round" | "oneway">("round")
  const [flightFrom, setFlightFrom] = useState("New York (JFK)")
  const [flightTo, setFlightTo] = useState("Paris (CDG)")
  const [departDate, setDepartDate] = useState<Date | undefined>(new Date("2026-08-23T00:00:00"))
  const [returnDate, setReturnDate] = useState<Date | undefined>(new Date("2026-08-30T00:00:00"))
  const [passengers, setPassengers] = useState("2 Adults, Business Class")

  // Hotel states (own dates — no longer borrowed from the flight tab)
  const [hotelLoc, setHotelLoc] = useState("Tokyo, Japan")
  const [hotelGuests, setHotelGuests] = useState("2 Guests, 1 Room")
  const [checkIn, setCheckIn] = useState<Date | undefined>(new Date("2026-10-14T00:00:00"))
  const [checkOut, setCheckOut] = useState<Date | undefined>(new Date("2026-10-20T00:00:00"))

  // Tour + Package states
  const [tourLoc, setTourLoc] = useState("Dubai, UAE")
  const [pkgLoc, setPkgLoc] = useState("Maldives Luxury Villa")

  const handleFlightSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const p = new URLSearchParams({
      from: flightFrom,
      to: flightTo,
      trip: tripType,
      class: passengers,
    })
    if (departDate) p.set("date", fmt(departDate))
    if (tripType === "round" && returnDate) p.set("ret", fmt(returnDate))
    router.push(`/flights?${p.toString()}`)
  }

  const handleHotelSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const p = new URLSearchParams({ q: hotelLoc })
    if (checkIn) p.set("checkin", fmt(checkIn))
    if (checkOut) p.set("checkout", fmt(checkOut))
    p.set("guests", hotelGuests)
    router.push(`/hotels?${p.toString()}`)
  }

  const handleTourSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/tours?q=${encodeURIComponent(tourLoc)}`)
  }

  const handlePackageSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/packages?q=${encodeURIComponent(pkgLoc)}`)
  }

  return (
    <section id="hero-search" className="relative min-h-[640px] flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 bg-[#111111] overflow-hidden">

      {/* Background image overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-35 scale-105 transition-transform duration-200"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop')`
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/70 to-[#111111]/80 pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#4F46E5]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#D97706]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-6xl w-full mx-auto text-center">

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-amber-300 text-xs font-medium uppercase tracking-wider mb-6 shadow-xl">
          <Sparkles className="w-3.5 h-3.5" /> Premium Corporate & Leisure Travel
        </div>

        {/* H1 Headline — mask-reveal wipe (hero only, not cards) */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-[-0.02em] leading-[1.15] max-w-4xl mx-auto mb-4">
          <span className="block overflow-hidden pb-1">
            <span className="mask-line">
              Elevate Your Journey With <br className="hidden sm:inline" />
            </span>
          </span>
          <span className="block overflow-hidden pb-1">
            <span
              className="mask-line bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent"
              style={{ "--mask-delay": "180ms" } as React.CSSProperties}
            >
              World-Class Luxury Travel
            </span>
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
          Book executive flights, 5-star handpicked hotels, curated tours, and all-inclusive holiday packages with 24/7 dedicated concierge.
        </p>

        {/* Main Search Box */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-5 sm:p-7 shadow-2xl border border-white/30 text-left">
          <Tabs defaultValue="flights" className="w-full">

            <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100/80 p-1.5 rounded-2xl mb-6">
              <TabsTrigger
                value="flights"
                className="rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2 data-[state=active]:bg-[#111111] data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
              >
                <Plane className="w-4 h-4 text-amber-400" /> Flights
              </TabsTrigger>
              <TabsTrigger
                value="hotels"
                className="rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2 data-[state=active]:bg-[#111111] data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
              >
                <Building2 className="w-4 h-4 text-amber-400" /> Hotels
              </TabsTrigger>
              <TabsTrigger
                value="tours"
                className="rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2 data-[state=active]:bg-[#111111] data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
              >
                <Compass className="w-4 h-4 text-amber-400" /> Tours
              </TabsTrigger>
              <TabsTrigger
                value="packages"
                className="rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2 data-[state=active]:bg-[#111111] data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
              >
                <Package className="w-4 h-4 text-amber-400" /> Packages
              </TabsTrigger>
            </TabsList>

            {/* FLIGHTS TAB */}
            <TabsContent value="flights" className="space-y-4 outline-none">
              <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-slate-700 pb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="triptype"
                    checked={tripType === "round"}
                    onChange={() => setTripType("round")}
                    className="accent-[#4F46E5]"
                  />
                  <span>Round Trip</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="triptype"
                    checked={tripType === "oneway"}
                    onChange={() => setTripType("oneway")}
                    className="accent-[#4F46E5]"
                  />
                  <span>One Way</span>
                </label>
                <Badge variant="outline" className="ml-auto text-emerald-700 bg-emerald-50 border-emerald-200 font-medium">
                  ✓ Free Flight Cancellation within 24h
                </Badge>
              </div>

              <form onSubmit={handleFlightSearch} className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
                <div className="md:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-medium text-slate-600 uppercase tracking-wider pl-1">From</span>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <Input
                        value={flightFrom}
                        onChange={(e) => setFlightFrom(e.target.value)}
                        className="pl-9.5 h-12 bg-slate-50 border-slate-200 font-medium text-slate-900 rounded-xl focus:bg-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-medium text-slate-600 uppercase tracking-wider pl-1">To</span>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-amber-500" />
                      <Input
                        value={flightTo}
                        onChange={(e) => setFlightTo(e.target.value)}
                        className="pl-9.5 h-12 bg-slate-50 border-slate-200 font-medium text-slate-900 rounded-xl focus:bg-white"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-4 grid grid-cols-2 gap-2.5">
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-medium text-slate-600 uppercase tracking-wider pl-1">Departure</span>
                    <Popover>
                      <PopoverTrigger className="w-full h-12 inline-flex items-center justify-start bg-slate-50 border border-slate-200 font-medium text-slate-800 rounded-xl px-3.5 text-xs hover:bg-slate-100 transition-colors cursor-pointer outline-none">
                        <CalendarIcon className="w-4 h-4 mr-2 text-slate-500" />
                        {departDate ? departDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Select"}
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white" align="start">
                        <Calendar mode="single" selected={departDate} onSelect={(d) => setDepartDate(d)} />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-medium text-slate-600 uppercase tracking-wider pl-1">Return</span>
                    <Popover>
                      <PopoverTrigger disabled={tripType === "oneway"} className="w-full h-12 inline-flex items-center justify-start bg-slate-50 border border-slate-200 font-medium text-slate-800 rounded-xl px-3.5 text-xs hover:bg-slate-100 transition-colors cursor-pointer outline-none disabled:opacity-50 disabled:cursor-not-allowed">
                        <CalendarIcon className="w-4 h-4 mr-2 text-slate-500" />
                        {tripType === "oneway" ? "N/A" : returnDate ? returnDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Select"}
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white" align="start">
                        <Calendar mode="single" selected={returnDate} onSelect={(d) => setReturnDate(d)} />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="md:col-span-3 space-y-1.5">
                  <span className="text-[11px] font-medium text-slate-600 uppercase tracking-wider pl-1">Travelers & Class</span>
                  <Select value={passengers} onValueChange={(val) => val && setPassengers(val)}>
                    <SelectTrigger className="h-12 bg-slate-50 border-slate-200 font-medium text-slate-900 rounded-xl">
                      <Users className="w-4 h-4 mr-1 text-slate-500" />
                      <SelectValue placeholder="Passengers" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      <SelectItem value="1 Adult, Economy">1 Adult, Economy</SelectItem>
                      <SelectItem value="2 Adults, Business Class">2 Adults, Business Class</SelectItem>
                      <SelectItem value="2 Adults, First Class">2 Adults, First Class VIP</SelectItem>
                      <SelectItem value="Family (2+2), Economy">Family (2 Adults + 2 Kids)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-12 pt-3">
                  <Button
                    type="submit"
                    className="w-full h-14 bg-[#D97706] hover:bg-[#B45309] text-white font-semibold text-base rounded-2xl shadow-xl shadow-amber-600/25 transition-all flex items-center justify-center gap-2 group"
                  >
                    <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Search Executive Flights Now
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* HOTELS TAB */}
            <TabsContent value="hotels" className="space-y-4 outline-none">
              <form onSubmit={handleHotelSearch} className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
                <div className="md:col-span-5 space-y-1.5">
                  <span className="text-[11px] font-medium text-slate-600 uppercase tracking-wider pl-1">Destination / Hotel Name</span>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <Input
                      value={hotelLoc}
                      onChange={(e) => setHotelLoc(e.target.value)}
                      className="pl-9.5 h-12 bg-slate-50 border-slate-200 font-medium text-slate-900 rounded-xl"
                      placeholder="City, landmark, or luxury hotel"
                      required
                    />
                  </div>
                </div>

                <div className="md:col-span-4 grid grid-cols-2 gap-2.5">
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-medium text-slate-600 uppercase tracking-wider pl-1">Check-in</span>
                    <Popover>
                      <PopoverTrigger className="w-full h-12 inline-flex items-center justify-start bg-slate-50 border border-slate-200 font-medium text-slate-800 rounded-xl px-3.5 text-xs hover:bg-slate-100 transition-colors cursor-pointer outline-none">
                        <CalendarIcon className="w-4 h-4 mr-2 text-slate-500" />
                        {checkIn ? checkIn.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Select"}
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white" align="start">
                        <Calendar mode="single" selected={checkIn} onSelect={(d) => setCheckIn(d)} />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-medium text-slate-600 uppercase tracking-wider pl-1">Check-out</span>
                    <Popover>
                      <PopoverTrigger className="w-full h-12 inline-flex items-center justify-start bg-slate-50 border border-slate-200 font-medium text-slate-800 rounded-xl px-3.5 text-xs hover:bg-slate-100 transition-colors cursor-pointer outline-none">
                        <CalendarIcon className="w-4 h-4 mr-2 text-slate-500" />
                        {checkOut ? checkOut.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Select"}
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white" align="start">
                        <Calendar mode="single" selected={checkOut} onSelect={(d) => setCheckOut(d)} />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="md:col-span-3 space-y-1.5">
                  <span className="text-[11px] font-medium text-slate-600 uppercase tracking-wider pl-1">Guests & Rooms</span>
                  <Select value={hotelGuests} onValueChange={(val) => val && setHotelGuests(val)}>
                    <SelectTrigger className="h-12 bg-slate-50 border-slate-200 font-medium text-slate-900 rounded-xl">
                      <Users className="w-4 h-4 mr-1 text-slate-500" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="1 Guest, 1 Room">1 Guest, 1 Room</SelectItem>
                      <SelectItem value="2 Guests, 1 Room">2 Guests, 1 Room</SelectItem>
                      <SelectItem value="4 Guests, 2 Rooms">4 Guests, 2 Suite Rooms</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-12 pt-3">
                  <Button
                    type="submit"
                    className="w-full h-14 bg-[#D97706] hover:bg-[#B45309] text-white font-semibold text-base rounded-2xl shadow-xl shadow-amber-600/25 transition-all flex items-center justify-center gap-2"
                  >
                    <Search className="w-5 h-5" /> Search 5-Star Hotels & Luxury Resorts
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* TOURS TAB */}
            <TabsContent value="tours" className="space-y-4 outline-none">
              <form onSubmit={handleTourSearch} className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
                <div className="md:col-span-12 space-y-1.5">
                  <span className="text-[11px] font-medium text-slate-600 uppercase tracking-wider pl-1">City or Tour Experience</span>
                  <div className="relative">
                    <Compass className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <Input
                      value={tourLoc}
                      onChange={(e) => setTourLoc(e.target.value)}
                      className="pl-9.5 h-12 bg-slate-50 border-slate-200 font-medium text-slate-900 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="md:col-span-12 pt-3">
                  <Button type="submit" className="w-full h-14 bg-[#D97706] hover:bg-[#B45309] text-white font-semibold text-base rounded-2xl shadow-xl shadow-amber-600/25">
                    <Compass className="w-5 h-5" /> Find Exclusive Guided Experiences
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* PACKAGES TAB */}
            <TabsContent value="packages" className="space-y-4 outline-none">
              <form onSubmit={handlePackageSearch} className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
                <div className="md:col-span-12 space-y-1.5">
                  <span className="text-[11px] font-medium text-slate-600 uppercase tracking-wider pl-1">Dream Destination</span>
                  <div className="relative">
                    <Package className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <Input
                      value={pkgLoc}
                      onChange={(e) => setPkgLoc(e.target.value)}
                      className="pl-9.5 h-12 bg-slate-50 border-slate-200 font-medium text-slate-900 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="md:col-span-12 pt-3">
                  <Button type="submit" className="w-full h-14 bg-[#D97706] hover:bg-[#B45309] text-white font-semibold text-base rounded-2xl shadow-xl shadow-amber-600/25">
                    <Package className="w-5 h-5" /> Search All-Inclusive Luxury Packages
                  </Button>
                </div>
              </form>
            </TabsContent>

          </Tabs>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-slate-300 text-xs sm:text-sm font-normal">
          <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-400" /> Best Price Guarantee</span>
          <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-400" /> 24/7 Dedicated Support</span>
          <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-400" /> Flexible Cancellations</span>
          <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-400" /> Bank-Grade SSL Payment</span>
        </div>

      </div>
    </section>
  )
}