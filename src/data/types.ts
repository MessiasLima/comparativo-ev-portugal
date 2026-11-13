import type { LucideIcon } from "lucide-react"

export type CriterionId =
  | "interior"
  | "comfort"
  | "brand"
  | "equipment"
  | "boot"
  | "sound"
  | "range"
  | "powerToWeight"
  | "efficiency"
  | "charging"
  | "satisfaction"

export type CriterionKind = "objective" | "editorial" | "rubric"
export type CriterionDirection = "higher" | "lower"
/** How the criterion score is obtained: proportional to the list leader, or absolute. */
export type CriterionScale = "relative" | "absolute"

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
  /** `relative` rescales against the best car; `absolute` uses the score as-is. */
  scale: CriterionScale
  weight: number
}

export type SourceType = "official" | "press" | "owner" | "database" | "pdf"

export interface Source {
  id: string
  label: string
  url?: string
  type: SourceType
}

export type HardPlasticLevel = "low" | "moderate" | "high" | "extensive"

/**
 * Rubric behind the interior criterion. Every component is judged 0–10 from
 * evidence (press, owner reports, direct inspection), never from the car's
 * position in the ranking.
 */
export interface InteriorAssessment {
  /** Soft-touch coverage on the surfaces occupants actually touch. */
  softTouch: number
  /** Leather/vegan leather, stitching quality and seat/steering-wheel nobility. */
  upholstery: number
  /** Restrained, coherent sophistication; showy or gratuitous design scores lower. */
  design: number
  /** Build solidity, panel fit and absence of squeaks/rattles. */
  assembly: number
  /** Share of visible/touchable hard plastic across the cabin. */
  hardPlastic: HardPlasticLevel
}

/**
 * Brand and after-sales rubric. Component marks are evidence-based 0–10 values;
 * the Portugal factory bonus applies only to a plant producing this marque's cars
 * in Portugal and is capped by brandScore at the overall maximum.
 */
export interface BrandAssessment {
  /** Age of the marque as an autonomous automotive brand, not the parent group's age. */
  globalBrandAge: number
  /** Years of the marque's current uninterrupted official presence in Portugal. */
  portugalMarketTenure: number
  /** Reach and maturity of authorized service workshops in Portugal. */
  portugalServiceNetwork: number
  /** European passenger-car production maturity: none to established series output. */
  europeanManufacturing: number
  /** Formal backing from established groups or the scale of an established OEM. */
  establishedGroupSupport: number
  /** Financial resilience of the marque or its transparently identified reporting entity. */
  financialStability: number
  /** True only if a Portugal plant actually builds this marque's cars in pilot or series production. */
  portugalFactory: boolean
}

export type SatisfactionEvidenceLevel = "limited" | "moderate" | "broad"

/**
 * Satisfaction rubric combining owner feedback with recurring defects and
 * safety recalls. Evidence-level caps prevent sparse records being treated as
 * proof that a model is problem-free.
 */
export interface SatisfactionAssessment {
  /** Owner sentiment from real-owner evidence and independent long-term tests. */
  ownerSentiment: number
  /** Frequency/severity of recurring owner-reported defects and complaints. */
  reportedDefects: number
  /** Model-specific safety recall record; service campaigns are distinguished. */
  recallRecord: number
  /** Available post-market exposure, not a quality score. */
  evidenceLevel: SatisfactionEvidenceLevel
}

export interface EditorialReview {
  /** Only used for editorial criteria. Objective criteria are calculated from specs. */
  baseScore?: number
  /** Required for rubric criteria; replaces `baseScore`. */
  assessment?: InteriorAssessment | BrandAssessment | SatisfactionAssessment
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
  /** Front storage capacity. Use 0 only when its absence is verified. */
  frunkL: number
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
