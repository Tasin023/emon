import { useEffect, useState } from 'react'
import * as THREE from 'three'
import { extractVideoPoster } from '../../lib/utils'
import type { AnyItem, ZoneData } from '../../types'

/** Downscale any oversized source texture to max 1024px on the GPU upload. */
function clampTextureSize(tex: THREE.Texture, max = 1024): THREE.Texture {
  const img = tex.image as HTMLImageElement | undefined
  if (!img || !img.width || Math.max(img.width, img.height) <= max) return tex
  const scale = max / Math.max(img.width, img.height)
  const w = Math.max(1, Math.round(img.width * scale))
  const h = Math.max(1, Math.round(img.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return tex
  ctx.drawImage(img, 0, 0, w, h)
  tex.dispose()
  return new THREE.CanvasTexture(canvas)
}

function thumbSource(item: AnyItem): string | null {
  if ('thumbnailUrl' in item && item.thumbnailUrl) return item.thumbnailUrl
  if ('imageUrl' in item) return item.imageUrl
  if ('beforeUrl' in item) return item.beforeUrl
  return null
}

export function useZoneAssets(zone: ZoneData, videoTextures: boolean) {
  const [state, setState] = useState<{ textures: (THREE.Texture | null)[]; progress: number }>({
    textures: [],
    progress: 0
  })

  useEffect(() => {
    if (!zone.items.length) {
      setState({ textures: [], progress: 1 })
      return
    }

    let cancelled = false
    const loaded: (THREE.Texture | null)[] = new Array(zone.items.length).fill(null)
    const videos: HTMLVideoElement[] = []
    let done = 0

    setState({ textures: [], progress: 0 })

    const bump = () => {
      if (!cancelled) setState({ textures: [...loaded], progress: done / zone.items.length })
    }

    const finalize = (i: number, tex: THREE.Texture | null) => {
      if (tex) {
        tex.colorSpace = THREE.SRGBColorSpace
        tex.anisotropy = 4
      }
      loaded[i] = tex
      done++
      bump()
    }

    const loader = new THREE.TextureLoader()
    loader.setCrossOrigin('anonymous')

    const loadThumb = (i: number) => {
      const item = zone.items[i]
      const direct = thumbSource(item)

      if (direct) {
        loader.load(
          direct,
          (t) => finalize(i, clampTextureSize(t)),
          undefined,
          () => finalize(i, null) // broken URL → placeholder card, never a crash
        )
        return
      }

      // video without a thumbnail → capture its first frame
      if ('mediaUrl' in item) {
        extractVideoPoster(item.mediaUrl).then((dataUrl) => {
          if (!dataUrl) {
            finalize(i, null)
            return
          }
          loader.load(
            dataUrl,
            (t) => finalize(i, clampTextureSize(t)),
            undefined,
            () => finalize(i, null)
          )
        })
        return
      }

      finalize(i, null)
    }

    zone.items.forEach((item, i) => {
      const wantsVideo = videoTextures && 'previewUrl' in item && !!item.previewUrl
      if (!wantsVideo) {
        loadThumb(i)
        return
      }
      const video = document.createElement('video')
      video.src = item.previewUrl!
      video.muted = true
      video.loop = true
      video.playsInline = true
      video.crossOrigin = 'anonymous'
      video.preload = 'auto'
      videos.push(video)
      let settled = false
      video.addEventListener(
        'loadeddata',
        () => {
          if (settled || cancelled) return
          settled = true
          video.play().catch(() => {})
          const tex = new THREE.VideoTexture(video)
          tex.colorSpace = THREE.SRGBColorSpace
          tex.generateMipmaps = false
          tex.minFilter = THREE.LinearFilter
          finalize(i, tex)
        },
        { once: true }
      )
      video.addEventListener(
        'error',
        () => {
          if (settled || cancelled) return
          settled = true
          loadThumb(i) // fall back to the static thumbnail
        },
        { once: true }
      )
    })

    return () => {
      cancelled = true
      loaded.forEach((t) => t?.dispose())
      videos.forEach((v) => {
        v.pause()
        v.removeAttribute('src')
        v.load()
      })
    }
  }, [zone, videoTextures])

  return state
}
