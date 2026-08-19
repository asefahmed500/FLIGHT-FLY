import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value?: React.ReactNode
  loading?: boolean
  hint?: React.ReactNode
  icon?: React.ReactNode
  iconClassName?: string
  className?: string
}

export function StatCard({ label, value, loading, hint, icon, iconClassName, className }: StatCardProps) {
  return (
    <Card
      className={cn(
        "rounded-xl border-slate-200/80 transition-all duration-200 hover:border-[#4F46E5]/30 hover:shadow-lg hover:shadow-slate-900/5",
        className
      )}
    >
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <div className="mt-1.5 text-2xl font-semibold tracking-[-0.01em]">
            {loading ? <Skeleton className="h-7 w-16" /> : value}
          </div>
          {hint && <div className="mt-1 text-xs font-medium">{hint}</div>}
        </div>
        {icon && (
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary",
              iconClassName
            )}
          >
            {icon}
          </div>
        )}
      </CardContent>
    </Card>
  )
}