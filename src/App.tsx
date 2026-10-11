import { useEffect, useMemo } from 'react'
import { content } from './content'
import { hexToRgbTriple, setMeta } from './lib/utils'
import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { GallerySection } from './components/GallerySection'
import { About } from './components/About'
import { Services } from './components/Services'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'
import { HireButton } from './components/HireButton'
import { NotFound } from './components/NotFound'
import { BackgroundFx } from './components/BackgroundFx'

export default function App() {
  // Unknown paths → clean 404 (works on GitHub Pages sub-paths too)
  const is404 = useMemo(() => {
    const base = import.meta.env.BASE_URL.replace(/\/+$/, '')
    const p = window.location.pathname.replace(/\/+$/, '')
    return p !== base && p !== `${base}/index.html`
  }, [])

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-rgb', hexToRgbTriple(content.site.accentHex))
    document.title = is404 ? '404 — Page not found' : content.site.seo.title
    setMeta('description', content.site.seo.description)
    setMeta('og:title', content.site.seo.title, 'property')
    setMeta('og:description', content.site.seo.description, 'property')

    const ld = document.createElement('script')
    ld.type = 'application/ld+json'
    ld.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: content.site.name,
      jobTitle: content.site.role,
      url: window.location.origin,
      sameAs: content.socials.map((s) => s.url)
    })
    document.head.appendChild(ld)
    return () => {
      document.head.removeChild(ld)
    }
  }, [is404])

  if (is404) return <NotFound />

  return (
    <div id="top" className="relative min-h-screen bg-ink font-sans text-zinc-300">
      <BackgroundFx />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:font-semibold focus:text-ink"
      >
        Skip to content
      </a>
      <Nav />
      <main id="main" className="relative z-10">
        <Hero />
        <GallerySection />
        <About />
        <Services />
        <Contact />
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
      <HireButton />
    </div>
  )
}
