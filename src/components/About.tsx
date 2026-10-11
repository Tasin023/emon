import { motion, useReducedMotion } from 'framer-motion'
import { content } from '../content'
import { portraitUrl } from '../media'

export function About() {
  const { about, site } = content
  const reduce = useReducedMotion()
  const initials = site.name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <section id="about" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6">
      <div className="grid gap-12 md:grid-cols-[1.2fr_1fr]">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">About</p>
          <h2 className="mt-2 font-display text-5xl text-zinc-100 sm:text-6xl">The editor behind the cut</h2>
          {about.bio.map((p, i) => (
            <p key={i} className="mt-5 leading-relaxed text-zinc-400">
              {p}
            </p>
          ))}
          <div className="mt-8 flex gap-10">
            {about.stats.map((s) => (
              <div key={s.label}>
                <p className="font-display text-4xl text-accent">{s.value}</p>
                <p className="mt-1 text-xs uppercase tracking-widest text-zinc-500">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col gap-6"
        >
          {/* Portrait — drop src/media/portrait.jpg and it shows up here */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-panel">
            {portraitUrl ? (
              <img
                src={portraitUrl}
                alt={`Portrait of ${site.name}`}
                className="aspect-[4/5] w-full object-cover"
              />
            ) : (
              <div className="grid aspect-[4/5] w-full place-items-center">
                <div className="text-center">
                  <p className="font-display text-7xl text-accent/70">{initials}</p>
                  <p className="mt-4 px-8 text-xs leading-relaxed text-zinc-500">
                    Drop <code className="text-accent">portrait.jpg</code> into{' '}
                    <code className="text-accent">src/media/</code> to show your photo here.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-panel p-6">
            <h3 className="font-display text-3xl text-zinc-100">Weapons of choice</h3>
            <ul className="mt-5 flex flex-wrap gap-2">
              {about.tools.map((t) => (
                <li key={t} className="rounded-full border border-white/10 px-4 py-1.5 text-sm text-zinc-300">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
