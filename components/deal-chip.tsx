import { Flame } from "lucide-react"

export function DealChip({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-950 shadow-md ${className}`}
    >
      <Flame className="h-3 w-3" /> Deal
    </span>
  )
}