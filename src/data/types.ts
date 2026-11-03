import type { LucideIcon } from "lucide-react"

export type CriterionId =
  | "interior"
  | "comfort"
  | "brand"
  | "equipment"
  | "sound"
  | "range"
  | "powerToWeight"
  | "efficiency"
  | "charging"
  | "satisfaction"

export type CriterionKind = "objective" | "editorial"
export type CriterionDirection = "higher" | "lower"

export interface CriterionDefinition {
  id: CriterionId
  number: number
  label: string
  shortLabel: string
  question: string
  description: string
  icon: LucideIcon
  kind: CriterionKind
  direction: CriterionDirection
  weight: number
}

export type SourceType = "official" | "press" | "owner" | "database" | "pdf"

export interface Source {
  id: string
  label: string
  url?: string
  type: SourceType
}

export interface EditorialReview {
  /** Only used for editorial criteria. Objective criteria are calculated from specs. */
  baseScore?: number
  summary: string
  pros?: string[]
  cons?: string[]
  sourceIds: string[]
}

export interface Price {
  amount: number
  currency: "EUR"
  vatIncluded: boolean
  asOf: string
  note: string
  sourceId: string
}

export interface Specs {
  powerKw: number
  powerHp: number
  torqueNm: number
  drivetrain: string
  acceleration0100: number
  topSpeedKmh: number
  batteryKwh: number
  usableBatteryKwh: number
  batteryChemistry: string
  rangeKm: number
  consumptionKwh100: number
  weightKg: number
  grossWeightKg: number
  lengthMm: number
  widthMm: number
  heightMm: number
  wheelbaseMm: number
  bootL: number
  frunkL?: number
  seats: number
  doors: number
  towingBrakedKg?: number
}

export interface Charging {
  acKw: number
  dcKw: number
  dcTime1080Min: number
  dcTime3080Min?: number
  connector: string
  v2l: boolean
  v2lKw?: number
  v2h: boolean
}

export interface Warranty {
  vehicle: string
  battery: string
  note: string
}

export interface CarOption {
  name: string
  price: number
  description: string
}

export interface DossierSection {
  title: string
  body: string
  bullets?: string[]
}

export interface Dossier {
  headline: string
  verdict: string
  pros: string[]
  cons: string[]
  bestFor: string
  sections: DossierSection[]
}

export interface Car {
  id: string
  slug: string
  brand: string
  model: string
  /** Variante/trim comercial. Faz parte do nome público: "Design", "VZ". */
  variant: string
  version: string
  year: number
  segment: string
  tagline: string
  accent: "copper" | "ocean"
  price: Price
  specs: Specs
  charging: Charging
  warranty: Warranty
  equipmentIncluded: string[]
  options: CarOption[]
  reviews: Record<CriterionId, EditorialReview>
  dossier: Dossier
  sources: Source[]
}
