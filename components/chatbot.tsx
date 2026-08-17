"use client"

import { useEffect, useRef, useState } from "react"
import { BotMessageSquare, X, Send, Sparkles } from "lucide-react"
import { FlightFlyMark } from "@/components/icons"

type ChatRole = "user" | "bot"

interface ChatMessage {
  id: number
  role: ChatRole
  text: string
}

const QUICK_REPLIES = ["Book a flight", "Visa help", "My bookings", "Talk to an agent"]

const WELCOME = `Welcome to FlightFly ✈️ Your corporate luxury travel concierge.\nAsk me about flights, hotels, visas, event tickets, deals or your bookings — or tap a suggestion below.`

function getBotReply(raw: string): string {
  const t = raw.toLowerCase()

  if (/\b(hi|hello|hey|good (morning|afternoon|evening))\b/.test(t)) {
    return "Hello! 👋 I'm Fly, the FlightFly concierge. How can I help you plan something extraordinary today?"
  }
  if (/\b(book|booking|reserve|reservation)\b/.test(t)) {
    return "You can book flights, hotels, tours, visas and tickets right from the homepage. Pick any offer and tap \u201cClaim Deal\u201d / \u201cApply Now\u201d \u2014 your reservation then lives in your dashboard at /dashboard, where you can track its status in real time."
  }
  if (/\b(cancel|refund|change|modify)\b/.test(t)) {
    return "Reservations start as \u201cpending\u201d. You can cancel a pending reservation yourself from /dashboard/bookings; once approved or rejected, contact your concierge for changes. Payment refunds follow your selected card or corporate invoice terms."
  }
  if (/\b(visa|schengen|b1|b2|immigration|passport)\b/.test(t)) {
    return "We handle global visas end-to-end \u2014 Schengen, US B1/B2, UK and UAE (see #visa-services). Each includes document review, appointment booking and status tracking. Tap \u201cApply Now\u201d on any visa card to start."
  }
  if (/\b(ticket|event|show|concert|cirque|burj|opera|experience)\b/.test(t)) {
    return "Our #tickets-experiences section covers sold-out events like Burj Khalifa Level 148, Cirque du Soleil premium seats, Opera galas and yacht experiences. Every ticket is booked with your name attached."
  }
  if (/\b(flight|fly|plane|airline|business class)\b/.test(t)) {
    return "Search flights in the hero bar at the top, then check #popular-deals for limited-time business & first class offers. Every fare includes taxes and a confirmed e-ticket with QR pass in your dashboard."
  }
  if (/\b(hotel|stay|suite|villa|resort)\b/.test(t)) {
    return "We curate 5-star stays \u2014 from overwater Maldives villas to Paris luxury suites. Browse #popular-deals and book instantly; room tier upgrades are selectable at checkout."
  }
  if (/\b(tour|package|holiday|trek|helicopter)\b/.test(t)) {
    return "Explore #trending-tours and holiday packages \u2014 private guided tours, Swiss Alps helicopter escapes and Amalfi yacht expeditions. Packages bundle transfers and experiences at a single price."
  }
  if (/\b(deal|offer|discount|promo|coupon|sale)\b/.test(t)) {
    return "Live limited-time deals are under #popular-deals \u2014 currently including visa bundles and event-ticket duo savings. New offers are published by our team regularly; check the HOT badge."
  }
  if (/\b(login|sign ?in|sign ?up|register|account|create)\b/.test(t)) {
    return "Head to /login \u2014 you can sign in with Google or email/password, or create a new VIP account in seconds. Once signed in, you get a personal dashboard with your bookings, QR passes and wishlist."
  }
  if (/\b(admin|manager|executive)\b/.test(t)) {
    return "Administrators have a dedicated control center at /admin with live bookings, user role management, the deals manager and a content CRM."
  }
  if (/\b(password|forgot|reset)\b/.test(t)) {
    return "On the /login page choose the \u201cForgot Password\u201d tab and enter your email \u2014 we send a secure reset link immediately."
  }
  if (/\b(price|pricing|pay|payment|card|invoice|cost|how much)\b/.test(t)) {
    return "Prices are shown in your selected currency (top banner). Pay instantly by credit/debit card or request a corporate invoice with Net 30 terms \u2014 both are secure and confirmed via e-ticket."
  }
  if (/\b(contact|agent|concierge|phone|call|support|human|speak)\b/.test(t)) {
    return "Our 24/7 Corporate Concierge is at +1 (800) 555-FLYFLY. You can also reach your personal agent from inside your dashboard after signing in."
  }
  if (/\b(thank|thanks|great|awesome)\b/.test(t)) {
    return "Anytime! ✨ I'm here whenever you need your next escape planned. Safe travels!"
  }
  if (/\b(hello|start over|menu|help|options)\b/.test(t) && t.length < 12) {
    return "Here's what I can help with: booking flights & hotels, visa processing, event tickets, tracking reservations, deals and payments. Just ask, or tap a suggestion below."
  }
  return `Great question \u2014 I'm best with flights, hotels, tours, visas, tickets, deals, bookings and login help. For anything specific you can also reach a human concierge 24/7 at +1 (800) 555-FLYFLY.`
}

export function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([{ id: 0, role: "bot", text: WELCOME }])
  const [input, setInput] = useState("")
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(1)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, typing, open])

  const send = (text: string) => {
    const clean = text.trim()
    if (!clean) return
    const userMsg: ChatMessage = { id: idRef.current++, role: "user", text: clean }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setTyping(true)
    setTimeout(() => {
      const botMsg: ChatMessage = { id: idRef.current++, role: "bot", text: getBotReply(clean) }
      setMessages((prev) => [...prev, botMsg])
      setTyping(false)
    }, 650)
  }

  return (
    <>
      {/* Floating launcher */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close concierge chat" : "Open concierge chat"}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#0F172A] text-white shadow-xl shadow-slate-900/30 transition-all hover:scale-105 hover:bg-[#1E40AF]"
      >
        {open ? <X className="h-6 w-6" /> : <BotMessageSquare className="h-6 w-6" />}
        {!open && <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span><span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500"></span></span>}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[28rem] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20">
          {/* Header */}
          <div className="flex items-center gap-3 bg-[#0F172A] px-4 py-3.5 text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/20">
              <FlightFlyMark className="h-5 w-5 text-amber-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-tight">Fly — FlightFly Concierge</p>
              <p className="flex items-center gap-1 text-[10px] text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Online 24/7
              </p>
            </div>
            <Sparkles className="h-4 w-4 text-amber-400" />
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex flex-1 flex-col gap-3 overflow-y-auto bg-slate-50 p-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm ${
                    m.role === "user"
                      ? "rounded-br-sm bg-[#1E40AF] text-white"
                      : "rounded-bl-sm border border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-3.5 py-3 shadow-sm">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]"></span>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]"></span>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"></span>
                </div>
              </div>
            )}
          </div>

          {/* Quick replies */}
          <div className="flex gap-2 overflow-x-auto border-t border-slate-100 bg-white px-3 py-2">
            {QUICK_REPLIES.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-medium text-slate-600 transition-colors hover:border-[#1E40AF] hover:bg-blue-50 hover:text-[#1E40AF]"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
            className="flex items-center gap-2 border-t border-slate-100 bg-white p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about flights, visas, bookings…"
              className="h-10 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-[13px] outline-none placeholder:text-slate-400 focus:border-[#1E40AF] focus:bg-white"
            />
            <button
              type="submit"
              aria-label="Send message"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D97706] text-white shadow-md transition-colors hover:bg-[#B45309]"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  )
}