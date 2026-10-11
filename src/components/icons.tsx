import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement>

function Svg(p: P) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={20}
      height={20}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...p}
    />
  )
}

export const IconX = (p: P) => (
  <Svg {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Svg>
)
export const IconChevronLeft = (p: P) => (
  <Svg {...p}>
    <path d="m15 18-6-6 6-6" />
  </Svg>
)
export const IconChevronRight = (p: P) => (
  <Svg {...p}>
    <path d="m9 18 6-6-6-6" />
  </Svg>
)
export const IconArrowDown = (p: P) => (
  <Svg {...p}>
    <path d="M12 5v14m-7-7 7 7 7-7" />
  </Svg>
)
export const IconExternal = (p: P) => (
  <Svg {...p}>
    <path d="M7 17 17 7m0 0H8m9 0v9" />
  </Svg>
)
export const IconMail = (p: P) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </Svg>
)
export const IconSend = (p: P) => (
  <Svg {...p}>
    <path d="m22 2-11 11" />
    <path d="M22 2 15 22l-4-9-9-4z" />
  </Svg>
)
export const IconChat = (p: P) => (
  <Svg {...p}>
    <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.5 0-2.9-.4-4.1-1L3 21l2-5.4A8.5 8.5 0 1 1 21 11.5z" />
  </Svg>
)
export const IconPhone = (p: P) => (
  <Svg {...p}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.7 2.6a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.6-1.3a2 2 0 0 1 2.1-.5c.8.4 1.7.6 2.6.7a2 2 0 0 1 1.7 2z" />
  </Svg>
)
export const IconReset = (p: P) => (
  <Svg {...p}>
    <path d="M3 12a9 9 0 1 0 3-6.7" />
    <path d="M3 4v5h5" />
  </Svg>
)
export const IconZoomIn = (p: P) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M11 8v6M8 11h6M21 21l-4.3-4.3" />
  </Svg>
)
export const IconZoomOut = (p: P) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M8 11h6M21 21l-4.3-4.3" />
  </Svg>
)
export const IconGrid = (p: P) => (
  <Svg {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </Svg>
)
export const IconPlay = (p: P) => (
  <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor" aria-hidden="true" focusable="false" {...p}>
    <path d="M8 5.6v12.8c0 .8.9 1.3 1.6.9l10.2-6.4c.6-.4.6-1.4 0-1.8L9.6 4.7c-.7-.4-1.6.1-1.6.9z" />
  </svg>
)
