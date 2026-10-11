import { motion, useReducedMotion } from 'framer-motion'
import { content } from '../content'
import { IconChat, IconMail, IconSend, IconPhone, IconExternal } from './icons'

export function Contact() {
  const { contact, socials } = content
  const reduce = useReducedMotion()
  const telegramHandle = '@' + contact.telegramUrl.replace(/^https?:\/\/t\.me\//i, '')

  const cards = [
    { href: `tel:${contact.phone.replace(/[^\d+]/g, '')}`, icon: <IconPhone />, label: 'Phone', sub: contact.phone },
    { href: contact.whatsappUrl, icon: <IconChat />, label: 'WhatsApp', sub: contact.phone },
    { href: `mailto:${contact.email}`, icon: <IconMail />, label: 'Email', sub: contact.email },
    { href: contact.telegramUrl, icon: <IconSend />, label: 'Telegram', sub: telegramHandle }
  ]

  return (
    <section id="contact" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 text-center sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">Contact</p>
      <h2 className="mt-2 font-display text-5xl text-zinc-100 sm:text-6xl">
        Let&rsquo;s make something people finish watching
      </h2>
      <p className="mt-4 text-zinc-400">{contact.responseNote}</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => (
          <motion.a
            key={c.label}
            href={c.href}
            target={c.href.startsWith('http') ? '_blank' : undefined}
            rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, delay: reduce ? 0 : i * 0.06 }}
            className="group rounded-2xl border border-white/10 bg-panel p-6 transition-colors hover:border-accent/60"
          >
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent/10 text-accent transition group-hover:bg-accent group-hover:text-ink">
              {c.icon}
            </span>
            <h3 className="mt-4 font-medium text-zinc-100">{c.label}</h3>
            <p className="mt-1 break-all text-sm text-zinc-500">{c.sub}</p>
          </motion.a>
        ))}
      </div>

      {socials.length > 0 && (
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:border-accent/60 hover:text-accent"
            >
              {s.label}
              <IconExternal width={14} height={14} />
            </a>
          ))}
        </div>
      )}
    </section>
  )
}
