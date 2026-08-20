"use client"

import { Link2 } from "lucide-react"
import { LiftGrid } from "@/components/listing/lift-grid"

interface PartnerLogo {
  name: string
  svg: (color: string) => React.ReactNode
}

const PARTNERS: PartnerLogo[] = [
  {
    name: "Nimbus Air",
    svg: (c) => (
      <>
        <path d="M3 15l9-5 9 5-2 2-7-3-7 3-2-2z" fill={c} />
        <rect x="11" y="4" width="2" height="5" rx="1" fill={c} />
        <text x="26" y="14.5" fontSize="13" fontWeight="700" letterSpacing="1" fill={c} fontFamily="inherit">
          NIMBUS
        </text>
      </>
    ),
  },
  {
    name: "AeroVoyage",
    svg: (c) => (
      <>
        <circle cx="8" cy="8" r="4.5" fill="none" stroke={c} strokeWidth="1.6" />
        <path d="M12 10.5l6 6" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
        <text x="26" y="12.5" fontSize="13" fontWeight="700" letterSpacing="0.5" fill={c} fontFamily="inherit">
          AERO
        </text>
        <text x="26" y="19" fontSize="8.5" fontWeight="600" letterSpacing="2" fill={c} opacity="0.85" fontFamily="inherit">
          VOYAGE
        </text>
      </>
    ),
  },
  {
    name: "Prestige",
    svg: (c) => (
      <>
        <path d="M8 5h8l-1.5 3h-5L8 5z" fill={c} />
        <path d="M6 8h12l3 5h-3l-1.5-2H7.5L6 13H3l3-5z" fill={c} />
        <text x="24" y="12.5" fontSize="13" fontWeight="700" letterSpacing="1" fill={c} fontFamily="inherit">
          PRESTIGE
        </text>
      </>
    ),
  },
  {
    name: "SkyLux",
    svg: (c) => (
      <>
        <path d="M2 10c5-3 11-4 18-3-1 7-2 11-4 12-1.5 1-3-.5-2.5-2 .3-1.2.8-2.3 1.2-3.5L8 14l-2 3-1.5-1L8 11c-2.3-1-4-1.5-6-1z" fill={c} />
        <text x="24" y="12.5" fontSize="13" fontWeight="700" letterSpacing="1.5" fill={c} fontFamily="inherit">
          SKYLUX
        </text>
      </>
    ),
  },
  {
    name: "Vantage Travel",
    svg: (c) => (
      <>
        <path d="M9 5l6 0-6 14h-2l6-14h2" transform="translate(1 0)" fill={c} opacity="0" />
        <path d="M5 5h10v2H9.5L12 9.5l-1.2 1.2L7.5 8H5V5z" fill={c} />
        <path d="M13 9h4v2h-1.5l4 4-1.4 1.4-4-4V14h-2v-4l1.9 0z" fill={c} />
        <text x="24" y="12.5" fontSize="13" fontWeight="700" letterSpacing="0.5" fill={c} fontFamily="inherit">
          VANTAGE
        </text>
      </>
    ),
  },
  {
    name: "Altitude Press",
    svg: (c) => (
      <>
        <rect x="3" y="5" width="14" height="10" rx="1" fill="none" stroke={c} strokeWidth="1.5" />
        <path d="M3 12h14" stroke={c} strokeWidth="1.5" />
        <path d="M6 8h6" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
        <text x="24" y="12.5" fontSize="12.5" fontWeight="700" letterSpacing="0.5" fill={c} fontFamily="inherit">
          ALTITUDE
        </text>
      </>
    ),
  },
]

export function TrustedBy() {
  return (
    <section className="border-y border-slate-200/70 bg-white py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 lg:flex-row lg:justify-between lg:gap-10">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-400">
            <Link2 className="h-3.5 w-3.5" /> Trusted by · As seen in
          </p>
          {/* Logo wall — Originkit interactive-grid: hovered logo lifts in 3D
              and its orthogonal neighbours tilt up with it. */}
          <LiftGrid
            columns={6}
            glow={false}
            className="grid w-full max-w-4xl grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-6"
          >
            {PARTNERS.map((partner) => (
              <div
                key={partner.name}
                title={partner.name}
                className="group flex items-center justify-center rounded-lg p-2"
              >
                <svg
                  viewBox="0 0 100 24"
                  className="h-7 w-full max-w-[7.5rem] cursor-pointer"
                  aria-label={partner.name}
                  role="img"
                >
                  {/* Grey at rest, cross-faded (not filtered) to brand colour on hover */}
                  <g opacity="1" className="transition-opacity duration-200 group-hover:opacity-0">
                    {partner.svg("#94A3B8")}
                  </g>
                  <g opacity="0" className="transition-opacity duration-200 group-hover:opacity-100">
                    {partner.svg("#111111")}
                  </g>
                </svg>
              </div>
            ))}
          </LiftGrid>
        </div>
      </div>
    </section>
  )
}