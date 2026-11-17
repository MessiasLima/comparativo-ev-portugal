import type { Car } from "@/data/types"
import { withSuspensionScore } from "@/lib/comfort"
import bydSealDesign from "./byd-seal-design.json"
import bydSeal from "./byd-seal-excellence-awd.json"
import cupraRaval from "./cupra-raval-vz.json"
import cupraTavascanDrive from "./cupra-tavascan-drive.json"
import cupraTavascanBase from "./cupra-tavascan-base.json"
import cupraTavascanEndurance from "./cupra-tavascan-endurance.json"
import cupraTavascanAdrenaline from "./cupra-tavascan-adrenaline.json"
import cupraTavascanVz from "./cupra-tavascan-vz.json"
import mazda6eHomuraPlus from "./mazda-6e-homura-plus.json"
import mazda6eTakumiPlus from "./mazda-6e-takumi-plus.json"
import mazda6eTakumi from "./mazda-6e-takumi.json"
import mazdaCx6eTakumi from "./mazda-cx-6e-takumi.json"
import mazdaCx6eTakumiPlus from "./mazda-cx-6e-takumi-plus.json"
import polestar4RearMotorPrime from "./polestar-4-rear-motor-prime.json"
import teslaModel3Standard from "./tesla-model-3-standard.json"
import teslaModel3PremiumLongRangeRwd from "./tesla-model-3-premium-long-range-rwd.json"
import teslaModel3PremiumLongRangeAwd from "./tesla-model-3-premium-long-range-awd.json"
import teslaModel3Performance from "./tesla-model-3-performance.json"
import teslaModelYStandard from "./tesla-model-y-standard.json"
import teslaModelYPremiumLongRangeRwd from "./tesla-model-y-premium-long-range-rwd.json"
import teslaModelYPremiumLongRangeAwd from "./tesla-model-y-premium-long-range-awd.json"
import teslaModelYPerformance from "./tesla-model-y-performance.json"
import xpengL03RwdStandardRange from "./xpeng-l03-rwd-standard-range.json"
import xpengL03RwdLongRange from "./xpeng-l03-rwd-long-range.json"
import xpengL03RwdLongRangeUltra from "./xpeng-l03-rwd-long-range-ultra.json"
import xpengL03AwdPerformanceUltra from "./xpeng-l03-awd-performance-ultra.json"
import xpengG6RwdStandardRange from "./xpeng-g6-rwd-standard-range.json"
import xpengG6RwdLongRange from "./xpeng-g6-rwd-long-range.json"
import xpengG6AwdPerformance from "./xpeng-g6-awd-performance.json"
import xpengG6AwdPerformanceBlackEdition from "./xpeng-g6-awd-performance-black-edition.json"
import leapmotorB05LifePro from "./leapmotor-b05-life-pro.json"
import leapmotorB05DesignProMax from "./leapmotor-b05-design-promax.json"

/**
 * Registo dos carros do comparativo.
 * Para adicionar um carro: criar o JSON nesta pasta e importá-lo aqui.
 * As notas, o ranking e o custo por ponto são calculados automaticamente.
 */
export const CARS = ([
  cupraRaval,
  cupraTavascanDrive,
  cupraTavascanBase,
  cupraTavascanEndurance,
  cupraTavascanAdrenaline,
  cupraTavascanVz,
  bydSeal,
  bydSealDesign,
  mazda6eTakumi,
  mazda6eTakumiPlus,
  mazda6eHomuraPlus,
  mazdaCx6eTakumi,
  mazdaCx6eTakumiPlus,
  polestar4RearMotorPrime,
  teslaModel3Standard,
  teslaModel3PremiumLongRangeRwd,
  teslaModel3PremiumLongRangeAwd,
  teslaModel3Performance,
  teslaModelYStandard,
  teslaModelYPremiumLongRangeRwd,
  teslaModelYPremiumLongRangeAwd,
  teslaModelYPerformance,
  xpengL03RwdStandardRange,
  xpengL03RwdLongRange,
  xpengL03RwdLongRangeUltra,
  xpengL03AwdPerformanceUltra,
  xpengG6RwdStandardRange,
  xpengG6RwdLongRange,
  xpengG6AwdPerformance,
  xpengG6AwdPerformanceBlackEdition,
  leapmotorB05LifePro,
  leapmotorB05DesignProMax,
] as unknown as Car[]).map(withSuspensionScore)
