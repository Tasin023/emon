export function hexToRgbTriple(hex: string): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim())
  if (!m) return '251 191 36'
  return `${parseInt(m[1], 16)} ${parseInt(m[2], 16)} ${parseInt(m[3], 16)}`
}

export function setMeta(key: string, value: string, attr: 'name' | 'property' = 'name'): void {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', value)
}

/** Deterministic PRNG so card layouts are stable between renders/reloads. */
export function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const posterCache = new Map<string, string | null>()

/**
 * Capture the first frame of a (local) video as a JPEG data URL.
 * Used for video thumbnails in both the 2D grid and the 3D cards.
 * Cached per source.
 */
export function extractVideoPoster(src: string): Promise<string | null> {
  const cached = posterCache.get(src)
  if (cached !== undefined) return Promise.resolve(cached)
  return new Promise((resolve) => {
    const v = document.createElement('video')
    v.preload = 'metadata'
    v.muted = true
    v.playsInline = true
    v.src = src
    let settled = false
    const done = (result: string | null) => {
      if (settled) return
      settled = true
      posterCache.set(src, result)
      v.removeAttribute('src')
      v.load()
      resolve(result)
    }
    v.addEventListener('error', () => done(null), { once: true })
    v.addEventListener(
      'loadeddata',
      () => {
        try {
          v.currentTime = Math.min(0.1, (v.duration || 1) / 10)
        } catch {
          done(null)
        }
      },
      { once: true }
    )
    v.addEventListener(
      'seeked',
      () => {
        try {
          const w = Math.min(v.videoWidth || 640, 640)
          const h = Math.round(w * ((v.videoHeight || 360) / (v.videoWidth || 640)))
          const canvas = document.createElement('canvas')
          canvas.width = w
          canvas.height = h
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            done(null)
            return
          }
          ctx.drawImage(v, 0, 0, w, h)
          done(canvas.toDataURL('image/jpeg', 0.72))
        } catch {
          done(null)
        }
      },
      { once: true }
    )
    window.setTimeout(() => done(null), 6000)
  })
}
