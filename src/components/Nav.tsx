import { useEffect, useState } from 'react'
import { content } from '../content'

const LINKS = [
  { href: '#work', label: 'Work' },
  { href: '#about', label: 'About' },
  { href: '#services', label: 'Services' },
  { href: '#contact', label: 'Contact' }
]

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        scrolled ? 'border-b border-white/10 bg-ink/85 backdrop-blur' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6" aria-label="Main">
        <a href="#top" className="font-display text-2xl tracking-wide text-zinc-50">
          {content.site.name}
        </a>
        <div className="flex items-center gap-6">
          <ul className="hidden gap-6 md:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="text-sm text-zinc-400 transition hover:text-accent">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#contact"
            className="rounded-full border border-accent/60 px-4 py-1.5 text-sm font-medium text-accent transition hover:bg-accent hover:text-ink"
          >
            Hire me
          </a>
        </div>
      </nav>
    </header>
  )
}
