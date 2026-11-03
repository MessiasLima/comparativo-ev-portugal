import type { Car } from "@/data/types"
import bydSealDesign from "./byd-seal-design.json"
import bydSeal from "./byd-seal-excellence-awd.json"
import cupraRaval from "./cupra-raval-vz.json"
import polestar4RearMotorPrime from "./polestar-4-rear-motor-prime.json"

/**
 * Registo dos carros do comparativo.
 * Para adicionar um carro: criar o JSON nesta pasta e importá-lo aqui.
 * As notas, o ranking e o custo por ponto são calculados automaticamente.
 */
export const CARS = [cupraRaval, bydSeal, bydSealDesign, polestar4RearMotorPrime] as unknown as Car[]
