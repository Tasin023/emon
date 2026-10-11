export interface Showreel {
  url: string
  poster: string
}

export interface Site {
  name: string
  role: string
  tagline: string
  accentHex: string
  bgHex: string
  seo: { title: string; description: string }
  showreel: Showreel
}

export interface ContactInfo {
  email: string
  phone: string
  whatsappUrl: string
  telegramUrl: string
  responseNote: string
}

export interface Social {
  label: string
  url: string
}

export interface Stat {
  value: string
  label: string
}

export interface About {
  bio: string[]
  tools: string[]
  stats: Stat[]
}

export interface Service {
  title: string
  description: string
  from: string
}

export interface ProcessStep {
  title: string
  text: string
}

export interface VideoItem {
  id: string
  title: string
  description: string
  alt: string
  mediaUrl: string
  thumbnailUrl?: string
  /** optional tiny 3–5s 480p clip used as a live 3D card texture */
  previewUrl?: string
}

export interface ImageItem {
  id: string
  title: string
  description: string
  alt: string
  imageUrl: string
}

export interface BeforeAfterItem {
  id: string
  title: string
  description: string
  alt: string
  beforeUrl: string
  afterUrl: string
}

export type AnyItem = VideoItem | ImageItem | BeforeAfterItem
export type ZoneKind = 'videos' | 'images' | 'beforeafter'

export interface ZoneData {
  id: ZoneKind
  label: string
  items: AnyItem[]
  /** card plane size in world units */
  width: number
  height: number
}

export interface FocusTarget {
  pos: [number, number, number]
  look: [number, number, number]
}

export interface Quality {
  dpr: [number, number]
  antialias: boolean
  particles: number
  videoTextures: boolean
}

/** Optional metadata matched by file/folder name to what's auto-scanned. */
export interface VideoMeta {
  file: string
  title?: string
  description?: string
  alt?: string
  thumbnailUrl?: string
  previewUrl?: string
}
export interface ImageMeta {
  file: string
  title?: string
  description?: string
  alt?: string
}
export interface BeforeAfterMeta {
  file: string
  title?: string
  description?: string
  alt?: string
}

export interface Content {
  site: Site
  contact: ContactInfo
  socials: Social[]
  about: About
  services: Service[]
  process: ProcessStep[]
  galleries: {
    videos: { label: string; items: VideoMeta[] }
    images: { label: string; items: ImageMeta[] }
    beforeAfter: { label: string; items: BeforeAfterMeta[] }
  }
}
