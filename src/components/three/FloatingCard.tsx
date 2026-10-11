import { useMemo, useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import type { AnyItem } from '../../types'

interface Props {
  item: AnyItem
  position: [number, number, number]
  rotation: [number, number, number]
  phase: number
  texture: THREE.Texture | null
  geometry: THREE.PlaneGeometry
  edgeGeometry: THREE.EdgesGeometry
  accent: string
  onOpen: (item: AnyItem, worldPos: [number, number, number]) => void
}

export function FloatingCard({
  item,
  position,
  rotation,
  phase,
  texture,
  geometry,
  edgeGeometry,
  accent,
  onOpen
}: Props) {
  const group = useRef<THREE.Group>(null!)
  const glowMat = useRef<THREE.MeshBasicMaterial>(null!)
  const anim = useRef({
    h: 0, // eased hover 0→1
    hT: 0,
    ux: 0.5, uy: 0.5, // eased pointer uv
    uxT: 0.5, uyT: 0.5,
    downX: 0,
    downY: 0
  })
  const base = useMemo(
    () => ({ pos: new THREE.Vector3(...position), rot: rotation }),
    [position, rotation]
  )
  const tmp = useRef(new THREE.Vector3())

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const a = anim.current
    a.h += (a.hT - a.h) * 0.12
    a.ux += (a.uxT - a.ux) * 0.15
    a.uy += (a.uyT - a.uy) * 0.15

    const g = group.current
    if (!g) return

    // idle: gentle float, tiny rotation sway
    g.position.set(
      base.pos.x + Math.cos(t * 0.32 + phase) * 0.13,
      base.pos.y + Math.sin(t * 0.42 + phase * 1.7) * 0.17,
      base.pos.z + Math.sin(t * 0.27 + phase) * 0.11
    )
    g.rotation.set(
      base.rot[0] + (a.uy - 0.5) * 0.55 * a.h, // tilt toward the cursor
      base.rot[1] - (a.ux - 0.5) * 0.55 * a.h,
      base.rot[2] + Math.sin(t * 0.18 + phase) * 0.012
    )
    g.scale.setScalar(1 + a.h * 0.09)
    if (glowMat.current) glowMat.current.opacity = 0.1 + a.h * 0.4
  })

  return (
    <group ref={group} position={position} rotation={rotation}>
      {/* the card */}
      <mesh
        geometry={geometry}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation()
          anim.current.hT = 1
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          anim.current.hT = 0
          anim.current.uxT = 0.5
          anim.current.uyT = 0.5
          document.body.style.cursor = ''
        }}
        onPointerMove={(e: ThreeEvent<PointerEvent>) => {
          if (e.uv) {
            anim.current.uxT = e.uv.x
            anim.current.uyT = e.uv.y
          }
        }}
        onPointerDown={(e: ThreeEvent<PointerEvent>) => {
          anim.current.downX = e.nativeEvent.clientX
          anim.current.downY = e.nativeEvent.clientY
        }}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation()
          const a = anim.current
          // ignore clicks that were actually camera drags
          if (Math.abs(e.nativeEvent.clientX - a.downX) + Math.abs(e.nativeEvent.clientY - a.downY) > 10) return
          group.current.getWorldPosition(tmp.current)
          onOpen(item, [tmp.current.x, tmp.current.y, tmp.current.z])
        }}
      >
        <meshBasicMaterial
          map={texture ?? undefined}
          color={texture ? '#ffffff' : '#15151d'}
          toneMapped={false}
        />
      </mesh>

      {/* additive rim glow behind the card */}
      <mesh
        geometry={geometry}
        position={[0, 0, -0.03]}
        scale={[1.07, 1.12, 1]}
        raycast={() => null}
      >
        <meshBasicMaterial
          ref={glowMat}
          color={accent}
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* bezel outline in front */}
      <lineSegments geometry={edgeGeometry} position={[0, 0, 0.01]} raycast={() => null}>
        <lineBasicMaterial color={accent} transparent opacity={0.5} depthWrite={false} />
      </lineSegments>
    </group>
  )
}
