import { SVGProps } from "react"

// Custom FlightFly brand & feature icons (inline SVG, inherit currentColor).

export function FlightFlyMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M2.5 11.9c3.4.9 6.6 1.7 9.7 2.7.8 2.1 1.5 4.2 2.4 6.2.2.5.9.6 1.2.2l.5-.7c1.5-2.1 3-4.2 4.6-6.2 1.1-.2 2.3-.4 3.6-.5.6-.1.6-1 0-1.1-1.3-.1-2.5-.3-3.6-.5-1.6-2-3.1-4.1-4.6-6.2l-.5-.7c-.3-.4-1-.3-1.2.2-.9 2-1.6 4.1-2.4 6.2-3.1 1-6.3 1.8-9.7 2.7-.6.2-.6 1.1 0 1.2Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function WingGlobeMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M3 12h18M12 3v18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

export function VipPassIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect x="2.5" y="6" width="19" height="12" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M6 10.5h3M6 13.5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M17.5 9.5a3 3 0 1 0 0 5 3 3 0 0 0 0-5Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M17.5 11v2M16.5 12h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function ConciergeStarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 3.5l2.2 4.9 5.3.6-4 3.6 1.1 5.2L12 15l-4.6 2.8 1.1-5.2-4-3.6 5.3-.6L12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M12 12v-1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

export function ShieldGlobeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 2.8l7 2.6v5.1c0 4.6-3 8-7 9.7-4-1.7-7-5.1-7-9.7V5.4l7-2.6Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="3.2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9 16.2c.9.7 1.9 1.1 3 1.1s2.1-.4 3-1.1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}