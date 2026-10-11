import { useEffect, useRef } from 'react'
import { content } from '../content'
import { hexToRgbTriple, extractVideoPoster } from '../lib/utils'
import { imageItems, videoItems } from '../media'

interface Dot {
  x: number
  y: number
  vx: number
  vy: number
  ex: number
  ey: number
  r: number
}

type ShapeKind = 'logo' | 'play' | 'film' | 'waveform' | 'record' | 'cut' | 'timeline'

interface Shape {
  kind: ShapeKind
  x: number
  y: number
  vx: number
  vy: number
  ex: number
  ey: number
  rot: number
  vrot: number
  vrotX: number
  sMul: number
  s: number
  scale: number
}

interface Tile {
  img: HTMLImageElement
  x: number
  y: number
  vx: number
  vy: number
  ex: number
  ey: number
  rot: number
  vrot: number
  vrotX: number
  s: number
  scale: number
}

interface Wave {
  yf: number
  amp: number
  len: number
  speed: number
  alpha: number
  width: number
  color: string
  phase: number
}

/**
 * Full-page interactive background (Canvas 2D — the 3D gallery keeps the
 * single WebGL context):
 *  - 3 flowing waves that bend toward the cursor
 *  - drifting constellation dots with connecting lines
 *  - floating editor glyphs (play / film / waveform / record / cut / timeline)
 *    + a logo tile with the editor's initials
 *  - ghosted thumbnails of the editor's real images and video first-frames
 *  - everything reacts to the cursor and to clicks (shockwave + spin)
 *  - pauses when the tab is hidden, disabled for prefers-reduced-motion
 */
export function BackgroundFx() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const canvas = canvasRef.current
    const glow = glowRef.current
    if (!canvas || !glow) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const accent = hexToRgbTriple(content.site.accentHex).replace(/\s+/g, ',') // "251,191,36"
    const white = '255,255,255'
    const initials = content.site.name
      .split(/\s+/)
      .map((word) => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)

    // ---- tuning knobs ----
    const MAX_DOTS = 80
    const LINK_DIST = 130
    const MOUSE_DIST = 160
    const SHAPE_REPEL = 200
    const LINK_DIST2 = LINK_DIST * LINK_DIST
    const MOUSE_DIST2 = MOUSE_DIST * MOUSE_DIST

    const waves: Wave[] = [
      { yf: 0.28, amp: 22, len: 260, speed: 0.5, alpha: 0.1, width: 1.5, color: accent, phase: 0 },
      { yf: 0.55, amp: 30, len: 360, speed: -0.35, alpha: 0.14, width: 2, color: accent, phase: 2 },
      { yf: 0.82, amp: 18, len: 190, speed: 0.7, alpha: 0.07, width: 1.5, color: white, phase: 4 }
    ]

    let w = 0
    let h = 0
    let dots: Dot[] = []
    let shapes: Shape[] = []
    let tiles: Tile[] = []
    let raf = 0
    let running = true
    let disposed = false

    const mouse = { x: -9999, y: -9999, active: false }
    const glowPos = { x: -9999, y: -9999 }

    const rnd = (min: number, max: number) => min + Math.random() * (max - min)

    const tileSize = () => Math.min(170, Math.max(70, Math.min(w, h) * 0.12))

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const count = Math.round(Math.min(MAX_DOTS, Math.max(30, (w * h) / 20000)))
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: rnd(-0.22, 0.22),
        vy: rnd(-0.22, 0.22),
        ex: 0,
        ey: 0,
        r: rnd(0.6, 2.1)
      }))

      const base = Math.min(w, h) * 0.055
      for (const sh of shapes) {
        sh.s = base * sh.sMul
        sh.x = Math.min(Math.max(sh.x, 0), w)
        sh.y = Math.min(Math.max(sh.y, 0), h)
      }
      for (const t of tiles) t.s = tileSize()
    }

    const initShapes = () => {
      const kinds: ShapeKind[] = [
        'logo', 'play', 'film', 'waveform', 'record', 'cut', 'timeline', 'play', 'film', 'waveform'
      ]
      shapes = kinds.map((kind) => ({
        kind,
        x: Math.random() * w,
        y: Math.random() * h,
        vx: rnd(-0.16, 0.16),
        vy: rnd(-0.16, 0.16),
        ex: 0,
        ey: 0,
        rot: rnd(-0.6, 0.6),
        vrot: rnd(-0.0018, 0.0018),
        vrotX: 0,
        sMul: kind === 'logo' ? 2.1 : rnd(0.9, 1.4),
        s: 0,
        scale: 1
      }))
    }

    const addTile = (src: string) => {
      if (disposed) return
      const img = new Image()
      img.src = src
      tiles.push({
        img,
        x: Math.random() * w,
        y: Math.random() * h,
        vx: rnd(-0.12, 0.12),
        vy: rnd(-0.12, 0.12),
        ex: 0,
        ey: 0,
        rot: rnd(-0.4, 0.4),
        vrot: rnd(-0.0012, 0.0012),
        vrotX: 0,
        s: tileSize(),
        scale: 1
      })
    }

    // up to 3 real images + first frames of up to 2 videos as ghost tiles
    imageItems.slice(0, 3).forEach((it) => addTile(it.imageUrl))
    videoItems.slice(0, 2).forEach((v) => {
      extractVideoPoster(v.mediaUrl).then((dataUrl) => {
        if (dataUrl) addTile(dataUrl)
      })
    })

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
      mouse.active = true
    }
    const onLeave = () => {
      mouse.active = false
      mouse.x = -9999
      mouse.y = -9999
    }
    const onDown = (e: PointerEvent) => {
      // click shockwave — shoves dots, spins shapes and tiles
      for (const p of dots) {
        const dx = p.x - e.clientX
        const dy = p.y - e.clientY
        const d = Math.hypot(dx, dy)
        if (d > 0.01 && d < 220) {
          const f = ((220 - d) / 220) * 3.4
          p.ex += (dx / d) * f
          p.ey += (dy / d) * f
        }
      }
      for (const sh of [...shapes, ...tiles]) {
        const dx = sh.x - e.clientX
        const dy = sh.y - e.clientY
        const d = Math.hypot(dx, dy)
        if (d > 0.01 && d < 260) {
          const f = ((260 - d) / 260) * 2.6
          sh.ex += (dx / d) * f
          sh.ey += (dy / d) * f
          sh.vrotX += (Math.random() > 0.5 ? 1 : -1) * 0.05
        }
      }
    }
    const onVis = () => {
      if (document.hidden) {
        running = false
        cancelAnimationFrame(raf)
      } else if (!running) {
        running = true
        raf = requestAnimationFrame(draw)
      }
    }

    // rounded-rect path helper (arcTo — works everywhere)
    const rrPath = (x: number, y: number, rw: number, rh: number, r: number) => {
      ctx.beginPath()
      ctx.moveTo(x + r, y)
      ctx.arcTo(x + rw, y, x + rw, y + rh, r)
      ctx.arcTo(x + rw, y + rh, x, y + rh, r)
      ctx.arcTo(x, y + rh, x, y, r)
      ctx.arcTo(x, y, x + rw, y, r)
      ctx.closePath()
    }

    const drawGlyph = (kind: ShapeKind, s: number) => {
      switch (kind) {
        case 'logo':
          ctx.lineWidth = 3
          rrPath(-s, -s * 0.6, s * 2, s * 1.2, s * 0.14)
          ctx.stroke()
          ctx.font = `${Math.max(12, Math.round(s * 0.9))}px "Bebas Neue", "Arial Narrow", sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(initials, 0, s * 0.05)
          ctx.lineWidth = 2
          break
        case 'play':
          ctx.beginPath()
          ctx.moveTo(-s * 0.4, -s * 0.6)
          ctx.lineTo(s * 0.55, 0)
          ctx.lineTo(-s * 0.4, s * 0.6)
          ctx.closePath()
          ctx.fill()
          ctx.stroke()
          break
        case 'film':
          rrPath(-s, -s * 0.68, s * 2, s * 1.36, s * 0.12)
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(-s / 3, -s * 0.68)
          ctx.lineTo(-s / 3, s * 0.68)
          ctx.moveTo(s / 3, -s * 0.68)
          ctx.lineTo(s / 3, s * 0.68)
          ctx.stroke()
          break
        case 'waveform':
          ctx.beginPath()
          for (let i = -2; i <= 2; i++) {
            const bh = s * (0.45 + 0.55 * Math.abs(Math.cos(i * 0.9)))
            const bx = i * s * 0.3
            ctx.moveTo(bx, -bh / 2)
            ctx.lineTo(bx, bh / 2)
          }
          ctx.stroke()
          break
        case 'record':
          ctx.beginPath()
          ctx.arc(0, 0, s * 0.7, 0, Math.PI * 2)
          ctx.stroke()
          ctx.beginPath()
          ctx.arc(0, 0, s * 0.25, 0, Math.PI * 2)
          ctx.fill()
          break
        case 'cut':
          ctx.beginPath()
          ctx.moveTo(-s * 0.6, -s * 0.6)
          ctx.lineTo(s * 0.6, s * 0.6)
          ctx.moveTo(s * 0.6, -s * 0.6)
          ctx.lineTo(-s * 0.6, s * 0.6)
          ctx.stroke()
          ctx.beginPath()
          ctx.arc(-s * 0.75, s * 0.75, s * 0.14, 0, Math.PI * 2)
          ctx.fill()
          ctx.beginPath()
          ctx.arc(s * 0.75, s * 0.75, s * 0.14, 0, Math.PI * 2)
          ctx.fill()
          break
        case 'timeline':
          ctx.beginPath()
          ctx.moveTo(-s * 0.45, -s * 0.55)
          ctx.lineTo(-s * 0.75, -s * 0.55)
          ctx.lineTo(-s * 0.75, s * 0.55)
          ctx.lineTo(-s * 0.45, s * 0.55)
          ctx.moveTo(s * 0.45, -s * 0.55)
          ctx.lineTo(s * 0.75, -s * 0.55)
          ctx.lineTo(s * 0.75, s * 0.55)
          ctx.lineTo(s * 0.45, s * 0.55)
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(0, -s * 0.75)
          ctx.lineTo(0, s * 0.75)
          ctx.stroke()
          ctx.beginPath()
          ctx.arc(0, 0, s * 0.12, 0, Math.PI * 2)
          ctx.fill()
          break
      }
    }

    const proximity = (x: number, y: number, radius: number) => {
      if (!mouse.active) return 0
      const d = Math.hypot(x - mouse.x, y - mouse.y)
      return Math.max(0, 1 - d / radius)
    }

    const repel = (o: { x: number; y: number }, radius: number, strength: number) => {
      if (!mouse.active) return
      const dx = o.x - mouse.x
      const dy = o.y - mouse.y
      const d2 = dx * dx + dy * dy
      if (d2 < radius * radius && d2 > 0.01) {
        const d = Math.sqrt(d2)
        const f = ((radius - d) / radius) * strength
        o.x += (dx / d) * f
        o.y += (dy / d) * f
      }
    }

    const wrap = (o: { x: number; y: number }, m: number) => {
      if (o.x < -m) o.x = w + m
      else if (o.x > w + m) o.x = -m
      if (o.y < -m) o.y = h + m
      else if (o.y > h + m) o.y = -m
    }

    const draw = () => {
      if (!running) return
      const t = performance.now() / 1000
      ctx.clearRect(0, 0, w, h)

      // ---- waves (bend toward the cursor) ----
      for (const wv of waves) {
        const yBase = wv.yf * h
        ctx.strokeStyle = `rgba(${wv.color},${wv.alpha})`
        ctx.lineWidth = wv.width
        ctx.beginPath()
        for (let px = 0; px <= w; px += 10) {
          let y = yBase + Math.sin((px / wv.len) * Math.PI * 2 + t * wv.speed + wv.phase) * wv.amp
          if (mouse.active) {
            const g = Math.exp(-((px - mouse.x) ** 2) / (2 * 160 * 160))
            y += (mouse.y - yBase) * g * 0.35
          }
          if (px === 0) ctx.moveTo(px, y)
          else ctx.lineTo(px, y)
        }
        ctx.stroke()
      }

      // ---- constellation lines (dot ↔ dot, dot ↔ cursor) ----
      ctx.lineWidth = 1
      for (let i = 0; i < dots.length; i++) {
        const a = dots[i]
        for (let j = i + 1; j < dots.length; j++) {
          const b = dots[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d2 = dx * dx + dy * dy
          if (d2 < LINK_DIST2) {
            const alpha = (1 - Math.sqrt(d2) / LINK_DIST) * 0.2
            ctx.strokeStyle = `rgba(${accent},${alpha})`
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
        if (mouse.active) {
          const dx = a.x - mouse.x
          const dy = a.y - mouse.y
          const d2 = dx * dx + dy * dy
          if (d2 < LINK_DIST2 * 1.4) {
            const alpha = (1 - Math.sqrt(d2) / (LINK_DIST * 1.2)) * 0.28
            ctx.strokeStyle = `rgba(${accent},${alpha})`
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(mouse.x, mouse.y)
            ctx.stroke()
          }
        }
      }

      // ---- dots ----
      for (const p of dots) {
        p.x += p.vx + p.ex
        p.y += p.vy + p.ey
        p.ex *= 0.94
        p.ey *= 0.94
        repel(p, MOUSE_DIST, 1.1)
        wrap(p, 20)
        ctx.fillStyle = `rgba(${accent},0.55)`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }

      // ---- floating glyph shapes ----
      for (const sh of shapes) {
        sh.x += sh.vx + sh.ex
        sh.y += sh.vy + sh.ey
        sh.ex *= 0.94
        sh.ey *= 0.94
        repel(sh, SHAPE_REPEL, 0.8)
        wrap(sh, sh.s + 30)
        sh.rot += sh.vrot + sh.vrotX
        sh.vrotX *= 0.96

        const prox = proximity(sh.x, sh.y, 240)
        sh.scale += (1 + prox * 0.35 - sh.scale) * 0.1
        const alpha = 0.14 + prox * 0.55

        ctx.save()
        ctx.translate(sh.x, sh.y)
        ctx.rotate(sh.rot)
        ctx.scale(sh.scale, sh.scale)
        ctx.strokeStyle = `rgba(${accent},${alpha})`
        ctx.fillStyle = `rgba(${accent},${alpha * 0.45})`
        ctx.lineWidth = 2
        drawGlyph(sh.kind, sh.s)
        ctx.restore()
      }

      // ---- ghosted media tiles (real images + video first-frames) ----
      for (const tl of tiles) {
        if (!tl.img.complete || tl.img.naturalWidth === 0 || tl.s < 10) continue
        tl.x += tl.vx + tl.ex
        tl.y += tl.vy + tl.ey
        tl.ex *= 0.94
        tl.ey *= 0.94
        repel(tl, 210, 0.7)
        wrap(tl, tl.s)
        tl.rot += tl.vrot + tl.vrotX
        tl.vrotX *= 0.96

        const prox = proximity(tl.x, tl.y, 260)
        tl.scale += (1 + prox * 0.25 - tl.scale) * 0.1
        const alpha = 0.18 + prox * 0.55

        const tw = tl.s
        const th = tl.s * (tl.img.naturalHeight / tl.img.naturalWidth)
        ctx.save()
        ctx.translate(tl.x, tl.y)
        ctx.rotate(tl.rot)
        ctx.scale(tl.scale, tl.scale)
        ctx.globalAlpha = alpha
        rrPath(-tw / 2, -th / 2, tw, th, 12)
        ctx.save()
        ctx.clip()
        ctx.drawImage(tl.img, -tw / 2, -th / 2, tw, th)
        ctx.restore()
        ctx.globalAlpha = Math.min(1, alpha * 1.6)
        ctx.strokeStyle = `rgba(${accent},0.9)`
        ctx.lineWidth = 1.5
        ctx.stroke()
        ctx.globalAlpha = 1
        ctx.restore()
      }

      // ---- soft glow trailing the cursor ----
      glowPos.x += (mouse.x - glowPos.x) * 0.06
      glowPos.y += (mouse.y - glowPos.y) * 0.06
      glow.style.transform = `translate3d(${glowPos.x - 350}px, ${glowPos.y - 350}px, 0)`

      raf = requestAnimationFrame(draw)
    }

    resize()
    initShapes()
    resize() // size the freshly created shapes

    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    document.addEventListener('visibilitychange', onVis)
    document.addEventListener('mouseleave', onLeave)
    raf = requestAnimationFrame(draw)

    return () => {
      disposed = true
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      document.removeEventListener('visibilitychange', onVis)
      document.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <>
      <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0" />
      <div
        ref={glowRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-0 h-[700px] w-[700px]"
        style={{
          background: 'radial-gradient(circle, rgb(var(--accent-rgb) / 0.08) 0%, transparent 70%)',
          transform: 'translate3d(-2000px, -2000px, 0)'
        }}
      />
    </>
  )
}
