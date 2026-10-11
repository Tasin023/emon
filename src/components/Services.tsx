import { motion, useReducedMotion } from 'framer-motion'
import { content } from '../content'

export function Services() {
  const { services, process } = content
  const reduce = useReducedMotion()

  return (
    <section id="services" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">Services</p>
      <h2 className="mt-2 font-display text-5xl text-zinc-100 sm:text-6xl">What I do</h2>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((s, i) => (
          <motion.div
            key={s.title}
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, delay: reduce ? 0 : i * 0.06 }}
            className="rounded-2xl border border-white/10 bg-panel p-6 transition-colors hover:border-accent/50"
          >
            <h3 className="font-medium text-zinc-100">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{s.description}</p>
            <p className="mt-4 text-sm font-semibold text-accent">{s.from}</p>
          </motion.div>
        ))}
      </div>

      <h3 className="mt-20 font-display text-4xl text-zinc-100">From brief to delivery</h3>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {process.map((step, i) => (
          <motion.div
            key={step.title}
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, delay: reduce ? 0 : i * 0.06 }}
          >
            <p className="font-display text-5xl text-accent/80">{String(i + 1).padStart(2, '0')}</p>
            <h4 className="mt-2 font-medium text-zinc-100">{step.title}</h4>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{step.text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
