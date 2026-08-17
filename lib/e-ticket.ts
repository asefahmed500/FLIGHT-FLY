"use client"

import jsPDF from "jspdf"
import QRCode from "qrcode"
import type { Booking } from "@/lib/types"

/**
 * Generates and downloads a boarding-pass style e-ticket PDF for a booking,
 * with a QR code encoding the booking reference.
 */
export async function downloadETicket(booking: Booking, userEmail?: string | null) {
  const doc = new jsPDF({ unit: "pt", format: "a4" })
  const W = doc.internal.pageSize.getWidth()

  // Header band
  doc.setFillColor(15, 23, 42)
  doc.rect(0, 0, W, 90, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(22)
  doc.text("FLIGHTFLY", 40, 45)
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(251, 191, 36)
  doc.text("EXECUTIVE TRAVEL E-TICKET", 40, 63)
  doc.setTextColor(148, 163, 184)
  doc.text("Official IATA & ATOL Accredited Agency", W - 40, 45, { align: "right" })
  doc.text("24/7 Concierge: +1 (800) 555-FLYFLY", W - 40, 63, { align: "right" })

  // Status pill
  const statusColors: Record<string, [number, number, number]> = {
    approved: [16, 185, 129],
    pending: [217, 119, 6],
    rejected: [225, 29, 72],
    cancelled: [100, 116, 139],
  }
  const [r, g, b] = statusColors[booking.status] ?? [100, 116, 139]
  doc.setFillColor(r, g, b)
  doc.roundedRect(W - 150, 100, 110, 24, 12, 12, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.text(booking.status.toUpperCase(), W - 95, 116, { align: "center" })

  // Title block
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(20)
  doc.text(booking.itemTitle, 40, 130, { maxWidth: W - 220 })

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.setTextColor(100, 116, 139)
  doc.text(booking.itemType.toUpperCase(), 40, 150)

  // Divider
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(1)
  doc.line(40, 170, W - 40, 170)

  // Details grid
  const details: [string, string][] = [
    ["Booking Reference", booking.refId],
    ["Primary Guest", booking.passengerName],
    ["Confirmation Email", booking.email],
    ["Contact Phone", booking.phone || "—"],
    ["Travel Date", booking.travelDate || "To be confirmed"],
    ["Travelers", booking.guests != null ? String(booking.guests) : "1"],
    ["Nationality", booking.nationality || "—"],
    ["Passport No.", booking.passportNumber || "—"],
    ["Class / Tier", booking.cabinClass],
    ["Payment", booking.paymentType === "card" ? "Credit / Debit Card" : "Corporate Invoice"],
    ["Account", userEmail || booking.userEmail],
    ["Total Amount", booking.price],
  ]

  const colX = [40, W / 2 + 10]
  const rowH = 34
  let row = 0
  for (const [label, value] of details) {
    const x = colX[row % 2]
    const y = 200 + Math.floor(row / 2) * rowH
    doc.setFontSize(8)
    doc.setTextColor(148, 163, 184)
    doc.text(label.toUpperCase(), x, y)
    doc.setFontSize(11)
    doc.setTextColor(15, 23, 42)
    doc.setFont("helvetica", "bold")
    doc.text(String(value), x, y + 14)
    doc.setFont("helvetica", "normal")
    row++
  }

  // Special requests
  const gridBottom = 200 + Math.ceil(details.length / 2) * rowH + 16
  if (booking.specialRequests) {
    doc.setFontSize(8)
    doc.setTextColor(148, 163, 184)
    doc.text("SPECIAL REQUESTS", 40, gridBottom)
    doc.setFontSize(10)
    doc.setTextColor(15, 23, 42)
    doc.text(booking.specialRequests, 40, gridBottom + 14, { maxWidth: W - 220 })
  }

  // QR code (booking reference payload)
  const qrDataUrl = await QRCode.toDataURL(
    JSON.stringify({ ref: booking.refId, item: booking.itemTitle, guest: booking.passengerName, status: booking.status }),
    { margin: 1, width: 240 }
  )
  const qrSize = 120
  const qrY = gridBottom + (booking.specialRequests ? 40 : 0)
  doc.setDrawColor(226, 232, 240)
  doc.roundedRect(W - 40 - qrSize, qrY, qrSize, qrSize, 8, 8)
  doc.addImage(qrDataUrl, "PNG", W - 40 - qrSize + 8, qrY + 8, qrSize - 16, qrSize - 16)
  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184)
  doc.text("Scan at check-in", W - 40 - qrSize / 2, qrY + qrSize + 14, { align: "center" })

  // Footer
  doc.setDrawColor(226, 232, 240)
  doc.line(40, doc.internal.pageSize.getHeight() - 70, W - 40, doc.internal.pageSize.getHeight() - 70)
  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184)
  doc.text(
    `Issued ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} • Present this e-ticket with a valid passport at check-in.`,
    40,
    doc.internal.pageSize.getHeight() - 52
  )
  doc.text("FlightFly Executive Travel • support@flightfly.com • flightfly.com", 40, doc.internal.pageSize.getHeight() - 38)

  doc.save(`FlightFly-E-Ticket-${booking.refId}.pdf`)
}