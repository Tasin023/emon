import { useCallback, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import type { AnyItem, FocusTarget, Quality, ZoneData } from '../../types'
import { Scene } from './Scene'
import { useZoneAssets } from './useZoneAssets'
import { zoneViewPos } from './CameraRig'

interface Props {
  zones: ZoneData[]
  activeZone: number
  accent: string
  bg: string
  quality: Quality
  overlayOpen: boolean
  onOpen: (item: AnyItem) => void
}

export default function Gallery3D({
  zones,
  activeZone,
  accent,
  bg,
  quality,
  overlayOpen,
  onOpen
}: Props) {
  const wrap = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(false)
  const [ready, setReady] = useState(false) // first load only; later zone swaps pop in
  const [resetToken, setResetToken] = useState(0)
  const [focus, setFocus] = useState<FocusTarget | null>(null)

  // lazy-load + dispose the ACTIVE zone's assets only
  const { textures, progress } = useZoneAssets(zones[activeZone], quality.videoTextures)
  useEffect(() => {
    if (progress >= 1) setReady(true)
  }, [progress])

  // mount the canvas only when the section approaches the viewport
  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: '400px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // overlay closed → release the camera so it flies home
  useEffect(() => {
    if (!overlayOpen) setFocus(null)
  }, [overlayOpen])

  const handleCardOpen = useCallback(
    (item: AnyItem, worldPos: [number, number, number]) => {
      const wp = new THREE.Vector3(...worldPos)
      const base = new THREE.Vector3(...zoneViewPos(activeZone))
      const dir = wp.clone().sub(base).normalize()
      const pos = wp.clone().sub(dir.multiplyScalar(3.6)) // stop 3.6 units in front of the card
      setFocus({ pos: [pos.x, pos.y, pos.z], look: worldPos })
      window.setTimeout(() => onOpen(item), 650) // open after the flight lands
    },
    [activeZone, onOpen]
  )

  // render ONLY while visible AND no fullscreen overlay on top
  const frameloop: 'always' | 'never' = near && !overlayOpen ? 'always' : 'never'

  return (
    <div
      ref={wrap}
      className="canvas-wrap relative h-[82vh] min-h-[520px] w-full overflow-hidden rounded-2xl border border-white/10 bg-ink"
    >
      {near && (
        <Canvas
          frameloop={frameloop}
          dpr={quality.dpr}
          camera={{ fov: 55, near: 0.1, far: 140, position: [0, 0.35, 10.5] }}
          gl={{ antialias: quality.antialias, powerPreference: 'high-performance' }}
        >
          <Scene
            zones={zones}
            activeZone={activeZone}
            textures={textures}
            focus={focus}
            resetToken={resetToken}
            onOpen={handleCardOpen}
            accent={accent}
            bg={bg}
            particleCount={quality.particles}
          />
        </Canvas>
      )}

      <div className="absolute right-3 top-3 z-10">
        <button
          type="button"
          onClick={() => setResetToken((t) => t + 1)}
          className="rounded-full border border-white/15 bg-ink/70 px-4 py-2 text-xs font-medium text-zinc-300 backdrop-blur transition hover:border-accent/60 hover:text-accent"
        >
          Reset view
        </button>
      </div>

      {ready && !focus && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-ink/70 px-4 py-2 text-[11px] text-zinc-400 backdrop-blur">
          Drag to look around · Click a card to open it
        </div>
      )}

      {!ready && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-ink/85 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-accent" />
            <p className="text-xs tracking-[0.25em] text-zinc-400">
              LOADING GALLERY {Math.round(progress * 100)}%
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
