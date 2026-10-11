import { content } from '../content'

export function Footer() {
  return (
    <footer className="border-t border-white/10 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-zinc-500 sm:flex-row">
        <span>
          © {new Date().getFullYear()} {content.site.name}. All frames reserved.
        </span>
        <span>Edited with care · Built with React &amp; Three.js</span>
      </div>
    </footer>
  )
}
