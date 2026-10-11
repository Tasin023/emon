import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { FocusTarget } from '../../types'

export const ZONE_GAP = 34
const UP = new THREE.Vector3(0, 1, 0)

// module-level temps — zero per-frame allocation
const _pos = new THREE.Vector3()
const _look = new THREE.Vector3()
const _dir = new THREE.Vector3()
const _right = new THREE.Vector3()

/** Zone camera pose. Portrait screens pull back so the grid fits. */
function zoneBaseInto(zone: number, aspect: number, pos: THREE.Vector3, look: THREE.Vector3) {
  const cz = -zone * ZONE_GAP
  const dist = aspect < 1 ? 15.5 : 10.5
  pos.set(0, 0.35, cz + dist)
  look.set(0, 0.1, cz - 2)
}

/** Plain helper for code outside the canvas (focus flight math). */
export function zoneViewPos(zone: number): [number, number, number] {
  return [0, 0.35, -zone * ZONE_GAP + 10.5]
}

export function CameraRig({
  activeZone,
  focus,
  resetToken
}: {
  activeZone: number
  focus: FocusTarget | null
  resetToken: number
}) {
  const { gl, camera } = useThree()
  const user = useRef({ yaw: 0, pitch: 0, yawT: 0, pitchT: 0 })
  const drag = useRef({ active: false, x: 0, y: 0, id: -1 })
  const focusRef = useRef<FocusTarget | null>(focus)
  const smoothPos = useRef(new THREE.Vector3(0, 0.35, 10.5))
  const smoothLook = useRef(new THREE.Vector3(0, 0.1, -2))

  useEffect(() => {
    focusRef.current = focus
  }, [focus])

  // "Reset view" — eases user look offsets back to center
  useEffect(() => {
    user.current.yawT = 0
    user.current.pitchT = 0
  }, [resetToken])

  // Drag to look around (mouse + touch). Invert the two signs below if you
  // prefer "grab-the-world" instead of "FPS-style" dragging.
  useEffect(() => {
    const el = gl.domElement
    const onDown = (e: PointerEvent) => {
      if (focusRef.current) return // locked while flying to a card
      drag.current = { active: true, x: e.clientX, y: e.clientY, id: e.pointerId }
      el.setPointerCapture(e.pointerId)
    }
    const onMove = (e: PointerEvent) => {
      const d = drag.current
      if (!d.active || focusRef.current) return
      const dx = e.clientX - d.x
      const dy = e.clientY - d.y
      d.x = e.clientX
      d.y = e.clientY
      const u = user.current
      u.yawT = THREE.MathUtils.clamp(u.yawT - dx * 0.0026, -0.6, 0.6) // ±34°
      u.pitchT = THREE.MathUtils.clamp(u.pitchT - dy * 0.0022, -0.35, 0.35) // ±20°
    }
    const onUp = (e: PointerEvent) => {
      if (drag.current.id === e.pointerId) drag.current.active = false
      el.releasePointerCapture?.(e.pointerId)
    }
    const onCancel = () => {
      drag.current.active = false
    }
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onCancel)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onCancel)
    }
  }, [gl])

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05) // clamp tab-switch spikes
    const u = user.current
    const f = focusRef.current

    u.yaw += (u.yawT - u.yaw) * (1 - Math.exp(-dt * 9))
    u.pitch += (u.pitchT - u.pitch) * (1 - Math.exp(-dt * 9))

    const aspect = state.size.width / Math.max(state.size.height, 1)
    let speed = 2.6 // zone-to-zone flight (cinematic)
    if (f) {
      _pos.set(...f.pos)
      _look.set(...f.look)
      speed = 5.5 // card focus (snappy)
    } else {
      zoneBaseInto(activeZone, aspect, _pos, _look)
    }

    _dir.copy(_look).sub(_pos).normalize()
    if (!f) {
      _dir.applyAxisAngle(UP, u.yaw)
      _right.crossVectors(_dir, UP).normalize()
      _dir.applyAxisAngle(_right, u.pitch)
    }
    _look.copy(_pos).addScaledVector(_dir, 10)

    const k = 1 - Math.exp(-dt * speed)
    smoothPos.current.lerp(_pos, k)
    smoothLook.current.lerp(_look, k)
    camera.position.copy(smoothPos.current)
    camera.lookAt(smoothLook.current)
  })

  return null
}
