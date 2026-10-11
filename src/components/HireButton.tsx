import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export function HireButton() {
  const [show, setShow] = useState(false)
  const [atContact, setAtContact] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.5)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    const contact = document.getElementById('contact')
    let io: IntersectionObserver | undefined
    if (contact) {
      io = new IntersectionObserver(([e]) => setAtContact(e.isIntersecting), { threshold: 0.15 })
      io.observe(contact)
    }
    return () => {
      window.removeEventListener('scroll', onScroll)
      io?.disconnect()
    }
  }, [])

  return (
    <AnimatePresence>
      {show && !atContact && (
        <motion.a
          href="#contact"
          aria-label="Hire me — go to contact"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          className="fixed bottom-6 right-6 z-40 rounded-full bg-accent px-6 py-3 font-semibold text-ink shadow-lg shadow-black/40 transition hover:opacity-90"
        >
          Hire me
        </motion.a>
      )}
    </AnimatePresence>
  )
}
