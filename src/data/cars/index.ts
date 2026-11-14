import type { Car } from "@/data/types"
import bydSealDesign from "./byd-seal-design.json"
import bydSeal from "./byd-seal-excellence-awd.json"
import cupraRaval from "./cupra-raval-vz.json"
import mazdaCx6eTakumi from "./mazda-cx-6e-takumi.json"
import mazdaCx6eTakumiPlus from "./mazda-cx-6e-takumi-plus.json"
import polestar4RearMotorPrime from "./polestar-4-rear-motor-prime.json"
import teslaModel3Standard from "./tesla-model-3-standard.json"
import teslaModel3PremiumLongRangeRwd from "./tesla-model-3-premium-long-range-rwd.json"
import teslaModel3PremiumLongRangeAwd from "./tesla-model-3-premium-long-range-awd.json"
import teslaModel3Performance from "./tesla-model-3-performance.json"

/**
 * Registo dos carros do comparativo.
 * Para adicionar um carro: criar o JSON nesta pasta e importá-lo aqui.
 * As notas, o ranking e o custo por ponto são calculados automaticamente.
 */
export const CARS = [
  cupraRaval,
  bydSeal,
  bydSealDesign,
  mazdaCx6eTakumi,
  mazdaCx6eTakumiPlus,
  polestar4RearMotorPrime,
  teslaModel3Standard,
  teslaModel3PremiumLongRangeRwd,
  teslaModel3PremiumLongRangeAwd,
  teslaModel3Performance,
] as unknown as Car[]
