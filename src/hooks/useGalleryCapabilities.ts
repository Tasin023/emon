import { useMemo } from 'react'
import type { Quality } from '../types'

export type Tier = 'low' | 'mid' | 'high'

function detectTier(): { tier: Tier; isMobile: boolean } {
  if (typeof window === 'undefined') return { tier: 'high', isMobile: false }
  const isMobile = window.matchMedia('(pointer: coarse)').matches
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
  const cores = navigator.hardwareConcurrency
  let tier: Tier = 'high'
  if (isMobile) tier = 'low'
  else if ((mem !== undefined && mem <= 4) || (cores !== undefined && cores <= 4)) tier = 'mid'
  return { tier, isMobile }
}

function qualityFor(tier: Tier): Quality {
  if (tier === 'high') return { dpr: [1, 2], antialias: true, particles: 300, videoTextures: true }
  if (tier === 'mid') return { dpr: [1, 1.75], antialias: true, particles: 180, videoTextures: false }
  return { dpr: [1, 1.5], antialias: false, particles: 110, videoTextures: false }
}

export function useGalleryCapabilities() {
  return useMemo(() => {
    const { tier, isMobile } = detectTier()
    return { tier, isMobile, quality: qualityFor(tier) }
  }, [])
}

/**
 * Auto 2D fallback: no WebGL / prefers-reduced-motion / touch device / weak hardware.
 * A saved manual preference always wins (both directions).
 */
export function initialGalleryView(): '3d' | '2d' {
  try {
    const saved = localStorage.getItem('gallery-view')
    if (saved === '3d' || saved === '2d') return saved
  } catch {
    /* private mode */
  }
  if (typeof window === 'undefined') return '2d'
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return '2d'
  let webgl = false
  try {
    const c = document.createElement('canvas')
    webgl = !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    webgl = false
  }
  if (!webgl) return '2d'
  if (window.matchMedia('(pointer: coarse)').matches) return '2d'
  const nav = navigator as Navigator & { deviceMemory?: number }
  if ((nav.deviceMemory !== undefined && nav.deviceMemory <= 2) || (navigator.hardwareConcurrency ?? 8) <= 2)
    return '2d'
  return '3d'
}
