import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { AnyItem, ZoneKind, BeforeAfterItem, ImageItem, VideoItem } from '../types'
import { VideoEmbed } from './VideoEmbed'
import { ImageViewer } from './ImageViewer'
import { CompareSlider } from './CompareSlider'
import { IconX, IconChevronLeft, IconChevronRight } from './icons'

interface Props {
  open: boolean
  items: AnyItem[]
  zoneKind: ZoneKind | null
  index: number
  onClose: () => void
  onIndexChange: (index: number) => void
}

export function Lightbox({ open, items, zoneKind, index, onClose, onIndexChange }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const item = items[index]
  const len = items.length

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      // don't hijack arrows while the compare-slider handle has focus
      const inSlider = !!t?.closest?.('[role="slider"]')
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight' && !inSlider && len) onIndexChange((index + 1) % len)
      else if (e.key === 'ArrowLeft' && !inSlider && len) onIndexChange((index - 1 + len) % len)
      else if (e.key === 'Tab') {
        // minimal focus trap
        const box = boxRef.current
        if (!box) return
        const focusables = Array.from(box.querySelectorAll<HTMLElement>('button, a[href]')).filter(
          (b) => b.offsetParent !== null
        )
        if (!focusables.length) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, index, len, onClose, onIndexChange])

  const nav = (d: number) => {
    if (len) onIndexChange((index + d + len) % len)
  }

  return (
    <AnimatePresence>
      {open && item && (
        <motion.div
          key="lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] bg-ink/95 backdrop-blur-md"
        >
          <div ref={boxRef} role="dialog" aria-modal="true" aria-label={item.title} className="flex h-full flex-col">
            <header className="flex items-start justify-between gap-4 border-b border-white/10 px-4 py-4 sm:px-8">
              <div className="min-w-0">
                <h3 className="truncate font-display text-2xl text-zinc-100">{item.title}</h3>
                <p className="mt-1 line-clamp-2 max-w-2xl text-sm text-zinc-400">{item.description}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="hidden text-xs tabular-nums text-zinc-500 sm:block">
                  {index + 1} / {len}
                </span>
                <button
                  type="button"
                  onClick={() => nav(-1)}
                  aria-label="Previous project"
                  className="rounded-full border border-white/15 p-2 text-zinc-300 transition hover:border-accent/60 hover:text-accent"
                >
                  <IconChevronLeft />
                </button>
                <button
                  type="button"
                  onClick={() => nav(1)}
                  aria-label="Next project"
                  className="rounded-full border border-white/15 p-2 text-zinc-300 transition hover:border-accent/60 hover:text-accent"
                >
                  <IconChevronRight />
                </button>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={onClose}
                  aria-label="Close (Esc)"
                  className="rounded-full border border-white/15 p-2 text-zinc-300 transition hover:border-accent/60 hover:text-accent"
                >
                  <IconX />
                </button>
              </div>
            </header>

            <div className="relative flex flex-1 items-center justify-center overflow-auto p-4 sm:p-8">
              {zoneKind === 'videos' && <VideoEmbed url={(item as VideoItem).mediaUrl} title={item.title} />}
              {zoneKind === 'images' && <ImageViewer src={(item as ImageItem).imageUrl} alt={item.alt} />}
              {zoneKind === 'beforeafter' && (
                <CompareSlider
                  before={(item as BeforeAfterItem).beforeUrl}
                  after={(item as BeforeAfterItem).afterUrl}
                  alt={item.alt}
                />
              )}

              <button
                type="button"
                onClick={() => nav(-1)}
                aria-label="Previous project"
                className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full border border-white/15 bg-ink/70 p-3 text-zinc-300 backdrop-blur transition hover:text-accent sm:block"
              >
                <IconChevronLeft width={24} height={24} />
              </button>
              <button
                type="button"
                onClick={() => nav(1)}
                aria-label="Next project"
                className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full border border-white/15 bg-ink/70 p-3 text-zinc-300 backdrop-blur transition hover:text-accent sm:block"
              >
                <IconChevronRight width={24} height={24} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
