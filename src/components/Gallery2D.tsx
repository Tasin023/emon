import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { extractVideoPoster } from '../lib/utils'
import type { AnyItem, ZoneData, VideoItem, ImageItem, BeforeAfterItem } from '../types'
import { IconPlay } from './icons'

const IMG_CLS = 'aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]'

/** Video card thumbnail — captured automatically from the video's first frame. */
function VideoPoster({ src, alt }: { src: string; alt: string }) {
  const [poster, setPoster] = useState<string | null>(null)
  useEffect(() => {
    let cancelled = false
    extractVideoPoster(src).then((p) => {
      if (!cancelled) setPoster(p)
    })
    return () => {
      cancelled = true
    }
  }, [src])

  if (poster) return <img src={poster} alt={alt} loading="lazy" decoding="async" className={IMG_CLS} />
  return (
    <div className="grid aspect-video w-full animate-pulse place-items-center bg-panel">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-accent/15 text-accent">
        <IconPlay width={22} height={22} />
      </span>
    </div>
  )
}

function CardMedia({ zoneId, item }: { zoneId: ZoneData['id']; item: AnyItem }) {
  if (zoneId === 'videos') {
    const v = item as VideoItem
    if (v.thumbnailUrl) {
      return <img src={v.thumbnailUrl} alt={v.alt} loading="lazy" decoding="async" className={IMG_CLS} />
    }
    return <VideoPoster src={v.mediaUrl} alt={v.alt} />
  }
  if (zoneId === 'images') {
    const im = item as ImageItem
    return <img src={im.imageUrl} alt={im.alt} loading="lazy" decoding="async" className={IMG_CLS} />
  }
  const ba = item as BeforeAfterItem
  return <img src={ba.beforeUrl} alt={ba.alt} loading="lazy" decoding="async" className={IMG_CLS} />
}

export function Gallery2D({ zone, onOpen }: { zone: ZoneData; onOpen: (index: number) => void }) {
  const reduce = useReducedMotion()

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {zone.items.map((item, i) => {
        const isVideo = zone.id === 'videos'
        const isBA = zone.id === 'beforeafter'
        return (
          <motion.button
            key={item.id}
            type="button"
            onClick={() => onOpen(i)}
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: reduce ? 0 : i * 0.05 }}
            className="group overflow-hidden rounded-xl border border-white/10 bg-panel text-left transition-colors hover:border-accent/60"
          >
            <div className="relative overflow-hidden">
              <CardMedia zoneId={zone.id} item={item} />
              {isVideo && (
                <span className="absolute inset-0 grid place-items-center bg-ink/30 opacity-0 transition group-hover:opacity-100">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-accent text-ink">
                    <IconPlay width={22} height={22} />
                  </span>
                </span>
              )}
              {isBA && (
                <span className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-ink">
                  Before / After
                </span>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-medium text-zinc-100">{item.title}</h3>
              {item.description && (
                <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{item.description}</p>
              )}
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}
