"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, ShieldCheck, Plane, Building2, Star, CreditCard, User, Download, ArrowRight, Compass, Package, Sticker, Ticket as TicketIcon, Phone, CalendarDays, Users, Globe2, FileBadge } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { createBooking } from "@/lib/app-data"
import { downloadETicket } from "@/lib/e-ticket"
import { useToastStore } from "@/lib/stores/toast-store"
import type { BookingItemType } from "@/lib/types"

// Zod Reservation Schema
const bookingSchema = z.object({
  passengerName: z.string().min(2, "Primary guest name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email for ticket confirmation"),
  phone: z.string().min(7, "Contact phone is required").regex(/^\+?[0-9 ()-]{7,20}$/, "Enter a valid phone number"),
  cabinClass: z.string().min(1, "Class selection is required"),
  paymentType: z.enum(["card", "invoice"]),
  travelDate: z.string().min(1, "Travel date is required").regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a valid date"),
  guests: z.string().refine((v) => {
      const n = Number(v)
      return Number.isInteger(n) && n >= 1 && n <= 12
    }, "Travelers must be 1–12"),
  nationality: z.string().min(2, "Nationality is required"),
  passportNumber: z.string().optional(),
  specialRequests: z.string().optional(),
})

type BookingFormValues = z.infer<typeof bookingSchema>

const TYPE_META: Record<BookingItemType, { icon: LucideIcon; optionLabel: string; options: string[] }> = {
  flight: { icon: Plane, optionLabel: "Service Class / Preference", options: ["Executive Business Class", "First Class Suite VIP", "Premium Economy"] },
  hotel: { icon: Building2, optionLabel: "Room Tier", options: ["Ocean View Suite", "Presidential Suite", "Garden Villa"] },
  tour: { icon: Compass, optionLabel: "Tour Group Type", options: ["Private Guided", "Small Group", "VIP Express"] },
  package: { icon: Package, optionLabel: "Package Tier", options: ["Signature Package", "Executive Package", "Elite Package"] },
  visa: { icon: Sticker, optionLabel: "Processing Speed", options: ["Standard Processing", "Express 72-Hour", "Same-Day Priority"] },
  ticket: { icon: TicketIcon, optionLabel: "Seating Section", options: ["Standard Seat", "Premium Club", "VIP Box"] },
}

interface BookingItem {
  title: string
  subtitle?: string
  price: string
  originalPrice?: string
  image?: string
  rating?: number
  type?: BookingItemType
}

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  item: BookingItem | null
}

export function BookingModal({ isOpen, onClose, item }: BookingModalProps) {
  const { user, profile } = useAuth()
  const pushToast = useToastStore((s) => s.push)
  const [step, setStep] = useState<"details" | "confirmation">("details")
  const [refId, setRefId] = useState("")
  const [submitError, setSubmitError] = useState("")
  const [confirmedData, setConfirmedData] = useState<BookingFormValues | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      passengerName: profile?.displayName || "",
      email: user?.email || "",
      phone: "",
      cabinClass: "Business Class",
      paymentType: "card",
      travelDate: "",
      guests: "1",
      nationality: "",
      passportNumber: "",
      specialRequests: "",
    },
  })

  const currentPaymentType = watch("paymentType")
  const currentCabinClass = watch("cabinClass")

  const itemType: BookingItemType = item?.type ?? "flight"
  const meta = TYPE_META[itemType]

  useEffect(() => {
    if (item) {
      setValue("cabinClass", TYPE_META[item.type ?? "flight"].options[0])
    }
  }, [item, setValue])

  if (!item) return null

  const onSubmit = async (data: BookingFormValues) => {
    setSubmitError("")
    if (!user) {
      setSubmitError("Please sign in to confirm your VIP reservation.")
      return
    }
    try {
      const { refId: createdRefId } = await createBooking(user, {
        passengerName: data.passengerName,
        email: data.email,
        phone: data.phone,
        itemTitle: item.title,
        itemType: item.type ?? "flight",
        price: item.price,
        cabinClass: data.cabinClass,
        paymentType: data.paymentType,
        travelDate: data.travelDate,
        guests: Number(data.guests),
        nationality: data.nationality,
        passportNumber: data.passportNumber,
        specialRequests: data.specialRequests,
      })
      setRefId(createdRefId)
      setConfirmedData(data)
      setStep("confirmation")
      pushToast({
        variant: "success",
        title: "Reservation submitted",
        description: `Reference ${createdRefId} is pending approval. Track it in your dashboard.`,
      })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create your reservation.")
    }
  }

  const handleReset = () => {
    setStep("details")
    setSubmitError("")
    reset({
      passengerName: profile?.displayName || "",
      email: user?.email || "",
      phone: "",
      cabinClass: "Business Class",
      paymentType: "card",
      travelDate: "",
      guests: "1",
      nationality: "",
      passportNumber: "",
      specialRequests: "",
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleReset()}>
      <DialogContent className="sm:max-w-[560px] p-0 overflow-y-auto max-h-[92dvh] bg-white border-slate-200 shadow-2xl rounded-2xl">
        <div className="bg-[#0F172A] p-5 text-white relative">
          <div className="flex items-center justify-between mb-2">
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Best Price Guaranteed
            </Badge>
            <span className="text-xs text-slate-300 font-mono">Postgres-backed</span>
          </div>
          <DialogTitle className="text-xl font-semibold tracking-[-0.01em] text-white flex items-center gap-2">
            {(() => { const Icon = meta.icon; return <Icon className="w-5 h-5 text-amber-400" /> })()}
            {item.title}
          </DialogTitle>
          {item.subtitle && <DialogDescription className="text-slate-300 text-xs mt-1 font-normal">{item.subtitle}</DialogDescription>}
        </div>

        {step === "details" ? (
          <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
            {/* Selected Booking Summary */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Selected Reservation</p>
                <p className="text-base font-semibold text-[#0F172A] mt-0.5">{item.title}</p>
                {item.rating && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-amber-600 font-medium">
                    <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" /> {item.rating} Executive Rating
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 font-normal">Total Price</p>
                <p className="text-xl font-semibold text-[#1E40AF]">{item.price}</p>
                {item.originalPrice && (
                  <p className="text-xs font-medium text-slate-400 line-through">{item.originalPrice}</p>
                )}
                <p className="text-[10px] text-emerald-600 font-medium">Taxes & fees included</p>
              </div>
            </div>

            {submitError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-600 text-center">
                {submitError}
                {!user && (
                  <Button render={<Link href="/login" />} size="sm" className="mt-2">
                    Sign in to continue <ArrowRight className="size-3.5" data-icon="inline-end" />
                  </Button>
                )}
              </div>
            )}

            {/* Guest & Contact Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="b-name" className="text-xs font-medium text-slate-700">Primary Guest / Passenger Name</Label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    id="b-name"
                    placeholder="e.g. Eleanor Vance"
                    {...register("passengerName")}
                    className="pl-9 h-10 border-slate-200 font-normal"
                  />
                </div>
                {errors.passengerName && (
                  <p className="text-xs text-rose-500 font-medium">{errors.passengerName.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="b-email" className="text-xs font-medium text-slate-700">Confirmation Email</Label>
                <Input
                  id="b-email"
                  type="email"
                  placeholder="name@domain.com"
                  {...register("email")}
                  className="h-10 border-slate-200 font-normal"
                />
                {errors.email && (
                  <p className="text-xs text-rose-500 font-medium">{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* Contact Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="b-phone" className="text-xs font-medium text-slate-700">Contact Phone</Label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <Input
                  id="b-phone"
                  type="tel"
                  placeholder="+1 555 000 1234"
                  {...register("phone")}
                  className="pl-9 h-10 border-slate-200 font-normal"
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-rose-500 font-medium">{errors.phone.message}</p>
              )}
            </div>

            {/* Travel Date + Travelers */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="b-date" className="text-xs font-medium text-slate-700">Preferred Travel Date</Label>
                <div className="relative">
                  <CalendarDays className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
                  <Input
                    id="b-date"
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    {...register("travelDate")}
                    className="pl-9 h-10 border-slate-200 font-normal"
                  />
                </div>
                {errors.travelDate && (
                  <p className="text-xs text-rose-500 font-medium">{errors.travelDate.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="b-guests" className="text-xs font-medium text-slate-700">Travelers</Label>
                <div className="relative">
                  <Users className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
                  <Input
                    id="b-guests"
                    type="number"
                    min={1}
                    max={12}
                    {...register("guests")}
                    className="pl-9 h-10 border-slate-200 font-normal"
                  />
                </div>
                {errors.guests && (
                  <p className="text-xs text-rose-500 font-medium">{errors.guests.message}</p>
                )}
              </div>
            </div>

            {/* Nationality + Passport */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="b-nationality" className="text-xs font-medium text-slate-700">Nationality</Label>
                <div className="relative">
                  <Globe2 className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    id="b-nationality"
                    placeholder="e.g. United States"
                    {...register("nationality")}
                    className="pl-9 h-10 border-slate-200 font-normal"
                  />
                </div>
                {errors.nationality && (
                  <p className="text-xs text-rose-500 font-medium">{errors.nationality.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="b-passport" className="text-xs font-medium text-slate-700">Passport No. <span className="text-slate-400">(optional)</span></Label>
                <div className="relative">
                  <FileBadge className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    id="b-passport"
                    placeholder="P12345678"
                    {...register("passportNumber")}
                    className="pl-9 h-10 border-slate-200 font-normal"
                  />
                </div>
              </div>
            </div>

            {/* Special Requests */}
            <div className="space-y-1.5">
              <Label htmlFor="b-requests" className="text-xs font-medium text-slate-700">Special Requests <span className="text-slate-400">(optional)</span></Label>
              <Textarea
                id="b-requests"
                rows={2}
                placeholder="Dietary needs, seating preferences, accessibility…"
                {...register("specialRequests")}
                className="border-slate-200 font-normal resize-none"
              />
            </div>

            {/* Class / Preference selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-700">{meta.optionLabel}</Label>
              <Select value={currentCabinClass} onValueChange={(val) => val && setValue("cabinClass", val)}>
                <SelectTrigger className="h-10 border-slate-200 font-normal text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {meta.options.map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-700">Payment Option</Label>
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setValue("paymentType", "card")}
                  className={`border p-3.5 rounded-xl flex items-center justify-between cursor-pointer transition-all ${currentPaymentType === "card" ? "border-[#1E40AF] bg-blue-50/50 shadow-sm" : "border-slate-200 hover:border-slate-300"}`}
                >
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#1E40AF]" />
                    <span className="text-xs font-medium text-[#0F172A]">Credit / Debit Card</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-medium">Instant</span>
                </div>

                <div
                  onClick={() => setValue("paymentType", "invoice")}
                  className={`border p-3.5 rounded-xl flex items-center justify-between cursor-pointer transition-all ${currentPaymentType === "invoice" ? "border-[#1E40AF] bg-blue-50/50 shadow-sm" : "border-slate-200 hover:border-slate-300"}`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-slate-600" />
                    <span className="text-xs font-medium text-slate-700">Corporate Invoice</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-normal">Net 30</span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between pt-1">
              <Button type="button" variant="outline" onClick={onClose} className="h-11 px-5 border-slate-200 font-medium">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="h-10 px-7 bg-[#D97706] hover:bg-[#B45309] text-white font-semibold shadow-lg shadow-amber-600/20">
                {isSubmitting ? "Processing..." : "Confirm & Reserve Ticket"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-semibold text-[#0F172A] tracking-[-0.01em]">Reservation Submitted!</h3>
            <p className="text-slate-600 text-sm max-w-xs mx-auto font-normal leading-relaxed">
              Your VIP booking for <span className="font-semibold text-slate-900">{item.title}</span> ({confirmedData?.cabinClass}) is pending approval under reference <strong className="text-slate-900">{refId}</strong>.
            </p>
            <p className="text-xs text-slate-500">
              Track status in your dashboard. Confirmation emailed to <strong className="text-slate-700">{confirmedData?.email}</strong>.
            </p>
            <div className="pt-4 flex items-center justify-center gap-3">
              <Button render={<Link href="/dashboard/bookings" />} onClick={handleReset} className="bg-[#0F172A] hover:bg-[#1E40AF] text-white px-6 h-11 font-medium">
                View My Booking
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (!confirmedData) return
                  downloadETicket(
                    {
                      id: "",
                      refId,
                      userId: user?.uid || "",
                      userEmail: user?.email || "",
                      passengerName: confirmedData.passengerName,
                      email: confirmedData.email,
                      phone: confirmedData.phone,
                      itemTitle: item.title,
                      itemType: item.type ?? "flight",
                      price: item.price,
                      cabinClass: confirmedData.cabinClass,
                      paymentType: confirmedData.paymentType,
                      travelDate: confirmedData.travelDate,
                      guests: Number(confirmedData.guests),
                      nationality: confirmedData.nationality,
                      passportNumber: confirmedData.passportNumber,
                      specialRequests: confirmedData.specialRequests,
                      status: "pending",
                    },
                    user?.email
                  )
                }}
                className="border-slate-200 px-4 h-11 font-medium flex items-center gap-1.5"
              >
                <Download className="w-4 h-4 text-slate-600" /> E-Ticket PDF
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}