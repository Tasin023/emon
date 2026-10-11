import { useEffect } from 'react'

export function NotFound() {
  useEffect(() => {
    document.title = '404 — Page not found'
  }, [])
  return (
    <div className="grid min-h-screen place-items-center bg-ink px-6 text-center">
      <div>
        <p className="font-display text-8xl text-accent">404</p>
        <p className="mt-4 text-zinc-400">This scene didn&rsquo;t make the final cut.</p>
        <a
          href="/"
          className="mt-8 inline-block rounded-full bg-accent px-6 py-3 font-semibold text-ink transition hover:opacity-90"
        >
          Back to the showreel
        </a>
      </div>
    </div>
  )
}
