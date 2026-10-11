import { useRef, useState } from 'react'

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

export function CompareSlider({ before, after, alt }: { before: string; after: string; alt: string }) {
  const [pos, setPos] = useState(50)
  const ref = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const setFromX = (clientX: number) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setPos(clamp(((clientX - r.left) / r.width) * 100, 0, 100))
  }

  return (
    <div
      ref={ref}
      className="relative aspect-video w-full max-w-4xl cursor-ew-resize select-none overflow-hidden rounded-xl"
      onPointerDown={(e) => {
        dragging.current = true
        e.currentTarget.setPointerCapture(e.pointerId)
        setFromX(e.clientX)
      }}
      onPointerMove={(e) => dragging.current && setFromX(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
    >
      <img src={after} alt={alt} draggable={false} className="absolute inset-0 h-full w-full object-cover" />
      <img
        src={before}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      />
      <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-accent" style={{ left: `${pos}%` }} />
      <div
        role="slider"
        tabIndex={0}
        aria-label="Before / after comparison slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        className="absolute top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-accent text-sm font-bold text-ink"
        style={{ left: `${pos}%` }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') setPos((p) => clamp(p - 4, 0, 100))
          if (e.key === 'ArrowRight') setPos((p) => clamp(p + 4, 0, 100))
        }}
      >
        ⇄
      </div>
      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-ink/70 px-3 py-1 text-[11px] uppercase tracking-widest text-zinc-300 backdrop-blur">
        Before
      </span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-accent px-3 py-1 text-[11px] uppercase tracking-widest text-ink">
        After
      </span>
    </div>
  )
}
