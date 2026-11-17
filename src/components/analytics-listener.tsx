"use client"

import { useEffect } from "react"
import {
  trackEvent,
  type AnalyticsData,
  type AnalyticsEvent,
} from "@/lib/analytics"

const PREFIX = "data-track-"

/** Envia para o Umami os cliques em elementos marcados com `trackAttributes`. */
export function AnalyticsListener() {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      const element = target.closest("[data-track]")
      if (!element) return

      const data: AnalyticsData = {}
      for (const attribute of Array.from(element.attributes)) {
        if (!attribute.name.startsWith(PREFIX)) continue
        const value = attribute.value
        data[attribute.name.slice(PREFIX.length)] = /^-?\d+(\.\d+)?$/.test(value)
          ? Number(value)
          : value === "true" || value === "false"
            ? value === "true"
            : value
      }

      trackEvent(element.getAttribute("data-track") as AnalyticsEvent, data)
    }

    document.addEventListener("click", handleClick, true)
    return () => document.removeEventListener("click", handleClick, true)
  }, [])

  return null
}
