import { useMemo } from 'react'

type Resolved =
  | { type: 'file'; src: string }
  | { type: 'iframe'; src: string }

function resolveEmbed(url: string): Resolved {
  // local / direct video files → native HTML5 player
  if (/\.(mp4|webm|mov|ogv|m4v)(\?.*)?$/i.test(url)) return { type: 'file', src: url }
  // Vimeo links are still supported if you ever paste one
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i)
  if (vm) return { type: 'iframe', src: `https://player.vimeo.com/video/${vm[1]}?autoplay=1` }
  return { type: 'iframe', src: url }
}

export function VideoEmbed({ url, title }: { url: string; title: string }) {
  const resolved = useMemo(() => resolveEmbed(url), [url])

  if (resolved.type === 'file') {
    return (
      <video
        src={resolved.src}
        controls
        autoPlay
        playsInline
        title={title}
        className="max-h-[70vh] w-full max-w-4xl rounded-xl bg-black"
      />
    )
  }

  return (
    <div className="aspect-video w-full max-w-4xl overflow-hidden rounded-xl bg-black">
      <iframe
        src={resolved.src}
        title={title}
        className="h-full w-full"
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  )
}
