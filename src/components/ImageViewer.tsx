import { useRef, useState } from 'react'
import { IconZoomIn, IconZoomOut } from './icons'

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

export function ImageViewer({ src, alt }: { src: string; alt: string }) {
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)

  const zoom = (dir: 1 | -1) => {
    setScale((s) => {
      const n = clamp(+(s + dir * 0.5).toFixed(2), 1, 3)
      if (n === 1) setOffset({ x: 0, y: 0 })
      return n
    })
  }

  return (
    <div className="w-full">
      <div
        className="relative overflow-hidden rounded-xl bg-black/40"
        style={{ cursor: scale > 1 ? 'grab' : 'zoom-in' }}
        onDoubleClick={() => zoom(scale >= 2 ? -1 : 1)}
        onPointerDown={(e) => {
          if (scale <= 1) return
          drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y }
          e.currentTarget.setPointerCapture(e.pointerId)
        }}
        onPointerMove={(e) => {
          if (!drag.current) return
          setOffset({
            x: clamp(drag.current.ox + e.clientX - drag.current.x, -600, 600),
            y: clamp(drag.current.oy + e.clientY - drag.current.y, -600, 600)
          })
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="mx-auto max-h-[65vh] w-auto max-w-full select-none"
          style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }}
        />
      </div>
      <div className="mt-3 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => zoom(-1)}
          aria-label="Zoom out"
          className="rounded-full border border-white/15 p-2 text-zinc-300 transition hover:border-accent/60 hover:text-accent"
        >
          <IconZoomOut />
        </button>
        <span className="w-12 text-center text-xs tabular-nums text-zinc-400">{Math.round(scale * 100)}%</span>
        <button
          type="button"
          onClick={() => zoom(1)}
          aria-label="Zoom in"
          className="rounded-full border border-white/15 p-2 text-zinc-300 transition hover:border-accent/60 hover:text-accent"
        >
          <IconZoomIn />
        </button>
      </div>
    </div>
  )
}
