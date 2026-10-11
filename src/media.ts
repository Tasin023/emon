import { content } from './content'
import type { VideoItem, ImageItem, BeforeAfterItem } from './types'

// NOTE: import.meta.glob REQUIRES literal patterns written inline —
// no variables, no wrapper functions.
const videoFiles = import.meta.glob('./media/videos/*.{mp4,webm,mov,ogv,m4v}', {
  eager: true,
  query: '?url',
  import: 'default'
}) as unknown as Record<string, string>

const imageFiles = import.meta.glob('./media/images/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  query: '?url',
  import: 'default'
}) as unknown as Record<string, string>

const baBeforeFiles = import.meta.glob('./media/beforeafter/*/before.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  query: '?url',
  import: 'default'
}) as unknown as Record<string, string>

const baAfterFiles = import.meta.glob('./media/beforeafter/*/after.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  query: '?url',
  import: 'default'
}) as unknown as Record<string, string>

const portraitFiles = import.meta.glob('./media/portrait.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  query: '?url',
  import: 'default'
}) as unknown as Record<string, string>

const showreelFiles = import.meta.glob('./media/showreel.{mp4,webm,mov}', {
  eager: true,
  query: '?url',
  import: 'default'
}) as unknown as Record<string, string>

const NO_ORDER = 1e9

/** "12-my-great-edit.mp4" → { order: 12, title: "My Great Edit" } */
function parseName(filename: string): { order: number; title: string } {
  const base = filename.replace(/\.[^.]+$/, '')
  const m = /^(\d+)[\s-_]+(.+)$/.exec(base)
  const raw = (m ? m[2] : base).replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim()
  const title = raw.replace(/\b\w/g, (c) => c.toUpperCase()) || filename
  return { order: m ? parseInt(m[1], 10) : NO_ORDER, title }
}

function fileNameOf(path: string): string {
  return path.split('/').pop() ?? path
}

function metaFor<T extends { file: string }>(list: T[] | undefined, file: string): T | undefined {
  return (list ?? []).find((m) => m.file === file)
}

export const videoItems: VideoItem[] = Object.entries(videoFiles)
  .map(([path, url]) => {
    const file = fileNameOf(path)
    const { order, title } = parseName(file)
    const meta = metaFor(content.galleries.videos.items, file)
    const item: VideoItem = {
      id: `video-${file}`,
      title: meta?.title ?? title,
      description: meta?.description ?? '',
      alt: meta?.alt ?? `${meta?.title ?? title} — video`,
      mediaUrl: url,
      thumbnailUrl: meta?.thumbnailUrl,
      previewUrl: meta?.previewUrl
    }
    return { order, title: item.title, item }
  })
  .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
  .map((e) => e.item)

export const imageItems: ImageItem[] = Object.entries(imageFiles)
  .map(([path, url]) => {
    const file = fileNameOf(path)
    const { order, title } = parseName(file)
    const meta = metaFor(content.galleries.images.items, file)
    const item: ImageItem = {
      id: `image-${file}`,
      title: meta?.title ?? title,
      description: meta?.description ?? '',
      alt: meta?.alt ?? `${meta?.title ?? title} — still`,
      imageUrl: url
    }
    return { order, title: item.title, item }
  })
  .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
  .map((e) => e.item)

export const beforeAfterItems: BeforeAfterItem[] = Object.entries(baBeforeFiles)
  .map(([path, beforeUrl]) => {
    const dir = path.split('/').slice(-2, -1)[0] ?? ''
    const afterEntry = Object.entries(baAfterFiles).find(
      ([p]) => (p.split('/').slice(-2, -1)[0] ?? '') === dir
    )
    if (!afterEntry) return null
    const { order, title } = parseName(dir)
    const meta = metaFor(content.galleries.beforeAfter.items, dir)
    const item: BeforeAfterItem = {
      id: `ba-${dir}`,
      title: meta?.title ?? title,
      description: meta?.description ?? '',
      alt: meta?.alt ?? `${meta?.title ?? title} — before and after`,
      beforeUrl,
      afterUrl: afterEntry[1]
    }
    return { order, title: item.title, item }
  })
  .filter((e): e is { order: number; title: string; item: BeforeAfterItem } => e !== null)
  .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
  .map((e) => e.item)

export const portraitUrl: string | null = Object.values(portraitFiles)[0] ?? null

/** content.json URL wins; otherwise src/media/showreel.mp4 is used */
export const showreelUrl: string = content.site.showreel.url || Object.values(showreelFiles)[0] || ''

export const showreelPoster: string = content.site.showreel.poster || ''
