import { Suspense, lazy, useCallback, useState } from 'react'
import { content } from '../content'
import { videoItems, imageItems, beforeAfterItems } from '../media'
import type { AnyItem, ZoneData, ZoneKind } from '../types'
import { useGalleryCapabilities, initialGalleryView } from '../hooks/useGalleryCapabilities'
import { Gallery2D } from './Gallery2D'
import { Lightbox } from './Lightbox'
import { IconGrid } from './icons'

// three.js lives in this lazy chunk — it never blocks the hero
const Gallery3D = lazy(() => import('./three/Gallery3D'))

const FOLDER_HINT: Record<ZoneKind, string> = {
  videos: 'src/media/videos/',
  images: 'src/media/images/',
  beforeafter: 'src/media/beforeafter/<name>/'
}
const FILE_HINT: Record<ZoneKind, string> = {
  videos: 'e.g. 01-brand-film.mp4',
  images: 'e.g. 02-grade-still.jpg',
  beforeafter: 'before.jpg + after.jpg inside the folder'
}

export function GallerySection() {
  const [zones] = useState<ZoneData[]>([
    { id: 'videos', label: content.galleries.videos.label, items: videoItems, width: 2.9, height: 1.63 },
    { id: 'images', label: content.galleries.images.label, items: imageItems, width: 2.35, height: 1.57 },
    {
      id: 'beforeafter',
      label: content.galleries.beforeAfter.label,
      items: beforeAfterItems,
      width: 3.0,
      height: 1.69
    }
  ])
  const { quality } = useGalleryCapabilities()

  const [view, setView] = useState<'3d' | '2d'>(initialGalleryView)
  const [activeZone, setActiveZone] = useState(0)
  const [overlay, setOverlay] = useState<{ zone: number; index: number } | null>(null)

  const zone = zones[activeZone]
  const isEmpty = zone.items.length === 0

  const openItem = useCallback(
    (item: AnyItem) => {
      const idx = zones[activeZone].items.indexOf(item)
      if (idx >= 0) setOverlay({ zone: activeZone, index: idx })
    },
    [activeZone, zones]
  )

  const toggleView = () => {
    setView((v) => {
      const next = v === '3d' ? '2d' : '3d'
      try {
        localStorage.setItem('gallery-view', next)
      } catch {
        /* ignore */
      }
      return next
    })
  }

  return (
    <section id="work" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">Portfolio</p>
          <h2 className="mt-2 font-display text-5xl text-zinc-100 sm:text-6xl">Selected work</h2>
        </div>
        <button
          type="button"
          onClick={toggleView}
          className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-zinc-300 transition hover:border-accent/60 hover:text-accent"
        >
          <IconGrid width={16} height={16} />
          {view === '3d' ? 'Switch to simple view' : 'Switch to 3D view'}
        </button>
      </header>

      {/* Gallery switcher — drives BOTH the 3D camera flights and the 2D grid filter */}
      <div
        role="tablist"
        aria-label="Gallery categories"
        className="mb-6 flex gap-2 overflow-x-auto pb-1"
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') setActiveZone((z) => (z + 1) % zones.length)
          if (e.key === 'ArrowLeft') setActiveZone((z) => (z - 1 + zones.length) % zones.length)
        }}
      >
        {zones.map((z, i) => (
          <button
            key={z.id}
            role="tab"
            aria-selected={i === activeZone}
            onClick={() => setActiveZone(i)}
            className={`shrink-0 rounded-full border px-5 py-2.5 text-sm font-medium transition ${
              i === activeZone
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-white/10 text-zinc-400 hover:border-white/30 hover:text-zinc-200'
            }`}
          >
            {z.label}
            <span className="ml-2 text-xs tabular-nums opacity-60">{z.items.length}</span>
          </button>
        ))}
      </div>

      {isEmpty ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-panel/50 p-12 text-center">
          <p className="font-display text-3xl text-zinc-300">Nothing here yet</p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-zinc-500">
            Drop your files into{' '}
            <code className="rounded bg-ink px-1.5 py-0.5 text-accent">{FOLDER_HINT[zone.id]}</code> (
            {FILE_HINT[zone.id]}) and they appear here automatically. The dev server picks them up
            instantly — run <code className="rounded bg-ink px-1.5 py-0.5 text-accent">npm run build</code>{' '}
            before deploying.
          </p>
        </div>
      ) : view === '3d' ? (
        <Suspense
          fallback={
            <div className="h-[82vh] min-h-[520px] animate-pulse rounded-2xl border border-white/10 bg-panel" />
          }
        >
          <Gallery3D
            zones={zones}
            activeZone={activeZone}
            accent={content.site.accentHex}
            bg={content.site.bgHex}
            quality={quality}
            overlayOpen={!!overlay}
            onOpen={openItem}
          />
        </Suspense>
      ) : (
        <Gallery2D zone={zone} onOpen={(i) => setOverlay({ zone: activeZone, index: i })} />
      )}

      <Lightbox
        open={!!overlay}
        items={overlay ? zones[overlay.zone].items : []}
        zoneKind={overlay ? zones[overlay.zone].id : null}
        index={overlay?.index ?? 0}
        onClose={() => setOverlay(null)}
        onIndexChange={(i) => overlay && setOverlay({ zone: overlay.zone, index: i })}
      />
    </section>
  )
}
