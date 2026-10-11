import { motion, useReducedMotion } from 'framer-motion'
import { content } from '../content'
import { showreelUrl, showreelPoster } from '../media'
import { IconArrowDown } from './icons'

export function Hero() {
  const { site } = content
  const reduce = useReducedMotion()

  return (
    <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden">
      {showreelUrl && (
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-35"
          poster={showreelPoster || undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        >
          <source src={showreelUrl} type="video/mp4" />
        </video>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/40 to-ink" />

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xs font-semibold uppercase tracking-[0.35em] text-accent"
        >
          {site.role}
        </motion.p>
        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="mt-4 font-display text-7xl leading-none text-zinc-50 sm:text-8xl md:text-9xl"
        >
          {site.name}
        </motion.h1>
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16 }}
          className="mx-auto mt-6 max-w-xl text-base text-zinc-300 sm:text-lg"
        >
          {site.tagline}
        </motion.p>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.24 }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <a
            href="#contact"
            className="rounded-full bg-accent px-7 py-3.5 font-semibold text-ink transition hover:opacity-90"
          >
            Hire me
          </a>
          <a
            href="#work"
            className="rounded-full border border-white/20 px-7 py-3.5 font-semibold text-zinc-100 transition hover:border-accent/70 hover:text-accent"
          >
            Explore my work
          </a>
        </motion.div>
      </div>

      <motion.a
        href="#work"
        aria-label="Scroll to work"
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-zinc-500 transition hover:text-accent"
        animate={reduce ? undefined : { y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.8 }}
      >
        <IconArrowDown width={26} height={26} />
      </motion.a>
    </section>
  )
}
