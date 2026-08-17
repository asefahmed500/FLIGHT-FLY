import {
  ShieldCheck,
  Headset,
  RefreshCw,
  CreditCard,
  Award,
  Sparkles,
  Building2,
  Plane,
  Gem,
  Clock,
  Globe,
  Heart,
  Star,
  BellRing,
  BadgeDollarSign,
  Landmark,
  Gift,
  type LucideIcon,
} from "lucide-react"

export const FEATURE_ICONS: Record<string, LucideIcon> = {
  shield: ShieldCheck,
  headset: Headset,
  refresh: RefreshCw,
  card: CreditCard,
  award: Award,
  sparkles: Sparkles,
  building: Building2,
  plane: Plane,
  gem: Gem,
  clock: Clock,
  globe: Globe,
  heart: Heart,
  star: Star,
  bell: BellRing,
  dollars: BadgeDollarSign,
  landmark: Landmark,
  gift: Gift,
}

export const FEATURE_ICON_NAMES = Object.keys(FEATURE_ICONS)

export function resolveFeatureIcon(name?: string): LucideIcon {
  return (name && FEATURE_ICONS[name]) || ShieldCheck
}