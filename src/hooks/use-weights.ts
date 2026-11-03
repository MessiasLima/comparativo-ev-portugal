"use client"

import { useCallback, useSyncExternalStore } from "react"
import {
  DEFAULT_WEIGHTS,
  getServerWeightsSnapshot,
  getWeightsSnapshot,
  isDefaultWeights,
  setWeightsStore,
  subscribeWeights,
  type WeightMap,
} from "@/lib/weights"

export function useWeights() {
  const weights = useSyncExternalStore(
    subscribeWeights,
    getWeightsSnapshot,
    getServerWeightsSnapshot,
  )

  const applyWeights = useCallback((next: WeightMap) => {
    setWeightsStore(next)
  }, [])

  const resetWeights = useCallback(() => {
    setWeightsStore({ ...DEFAULT_WEIGHTS })
  }, [])

  return {
    weights,
    applyWeights,
    resetWeights,
    customized: !isDefaultWeights(weights),
  }
}
