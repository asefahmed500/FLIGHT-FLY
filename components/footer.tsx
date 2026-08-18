"use client"

import { ShieldCheck, PhoneCall, Mail, MapPin, Globe, CreditCard, Lock } from "lucide-react"
import Link from "next/link"
import { FlightFlyMark } from "@/components/icons"

export function Footer() {
  return (
    <footer className="bg-[#111111] text-slate-400 text-sm border-t border-slate-800">
      
      {/* Upper Footer Links Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Bio */}
          <div className="lg:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-slate-950 shadow-md transition-colors group-hover:bg-[#4F46E5]">
                <FlightFlyMark className="h-6 w-6 transition-transform group-hover:scale-110" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                FLIGHT<span className="text-[#4F46E5]">FLY</span>
                <span className="ml-1 inline-block h-2 w-2 rounded-full bg-[#D97706]"></span>
              </span>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed">
              FlightFly is a premier global corporate travel platform providing executive flight booking, luxury resorts, curated tours, and VIP concierge services.
            </p>

            <div className="pt-2 text-xs space-y-1.5 text-slate-300">
              <p className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-amber-400" /> +1 (800) 555-FLYFLY
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400" /> concierge@flightfly.com
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400" /> 500 Fifth Avenue, Suite 4200, NYC
              </p>
            </div>
          </div>

          {/* Column 2: Destinations */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Top Destinations</h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#featured-destinations" className="hover:text-white transition-colors">Flights to Paris</a></li>
              <li><a href="#featured-destinations" className="hover:text-white transition-colors">Luxury Resorts in Bali</a></li>
              <li><a href="#featured-destinations" className="hover:text-white transition-colors">Dubai 5-Star Hotels</a></li>
              <li><a href="#featured-destinations" className="hover:text-white transition-colors">First Class to Tokyo</a></li>
              <li><a href="#featured-destinations" className="hover:text-white transition-colors">New York Executive Suites</a></li>
              <li><a href="#featured-destinations" className="hover:text-white transition-colors">Maldives Overwater Villas</a></li>
            </ul>
          </div>

          {/* Column 3: Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Travel Services</h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#hero-search" className="hover:text-white transition-colors">Business & First Class Flights</a></li>
              <li><a href="#hero-search" className="hover:text-white transition-colors">Boutique & Luxury Stays</a></li>
              <li><a href="#hero-search" className="hover:text-white transition-colors">Private Helicopter & Yacht Charter</a></li>
              <li><a href="#hero-search" className="hover:text-white transition-colors">Corporate Travel Management</a></li>
              <li><a href="#hero-search" className="hover:text-white transition-colors">Group & Event Booking</a></li>
              <li><a href="#hero-search" className="hover:text-white transition-colors">Executive Loyalty Program</a></li>
            </ul>
          </div>

          {/* Column 4: Customer Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Customer Support</h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#app-newsletter" className="hover:text-white transition-colors">24/7 Concierge Help Center</a></li>
              <li><a href="/dashboard/bookings" className="hover:text-white transition-colors">Manage Your Reservation</a></li>
              <li><a href="/flights" className="hover:text-white transition-colors">Baggage Allowance Policy</a></li>
              <li><a href="/packages" className="hover:text-white transition-colors">Comprehensive Travel Insurance</a></li>
              <li><a href="/visa" className="hover:text-white transition-colors">Visa & Entry Requirements</a></li>
              <li><a href="/dashboard/bookings" className="hover:text-white transition-colors">Refund & Cancellation Rules</a></li>
            </ul>
          </div>

          {/* Column 5: Trust & Accreditations */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Trust & Security</h4>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <span className="font-bold text-white block">IATA Accredited</span>
                  <span className="text-[10px] text-slate-400">License # 91-284920</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5">
                <Lock className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold text-white block">256-Bit SSL Secure</span>
                  <span className="text-[10px] text-slate-400">Bank-Grade Encryption</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Payment Provider & Trust Strip */}
      <div className="bg-[#0A0A0A] py-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          
          <div className="flex items-center gap-6 text-slate-400">
            <span className="text-slate-300 font-semibold">Accepted Payments:</span>
            <div className="flex items-center gap-3 text-slate-300 font-bold">
              <span className="bg-white/10 px-2 py-1 rounded text-[10px]">VISA</span>
              <span className="bg-white/10 px-2 py-1 rounded text-[10px]">MASTERCARD</span>
              <span className="bg-white/10 px-2 py-1 rounded text-[10px]">AMEX</span>
              <span className="bg-white/10 px-2 py-1 rounded text-[10px]">APPLE PAY</span>
              <span className="bg-white/10 px-2 py-1 rounded text-[10px]">PAYPAL</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
            <span>•</span>
            <a href="/privacy" className="hover:text-white transition-colors">Cookie Settings</a>
          </div>

        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="bg-[#050505] py-4 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} FlightFly Travel Technologies Inc. All rights reserved.</p>
      </div>

    </footer>
  )
}
