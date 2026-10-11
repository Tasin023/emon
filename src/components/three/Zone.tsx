import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { mulberry32 } from '../../lib/utils'
import type { AnyItem } from '../../types'
import { ZONE_GAP } from './CameraRig'
import { FloatingCard } from './FloatingCard'

interface Props {
  zoneIndex: number
  items: AnyItem[]
  textures: (THREE.Texture | null)[]
  geometry: THREE.PlaneGeometry
  edgeGeometry: THREE.EdgesGeometry
  accent: string
  onOpen: (item: AnyItem, worldPos: [number, number, number]) => void
}

export function Zone({ zoneIndex, items, textures, geometry, edgeGeometry, accent, onOpen }: Props) {
  const group = useRef<THREE.Group>(null!)
  const { size } = useThree()
  const isPortrait = size.width / Math.max(size.height, 1) < 0.9

  useFrame((state) => {
    // slow drift of the whole cluster
    if (group.current) {
      group.current.position.x = Math.sin(state.clock.elapsedTime * 0.06 + zoneIndex * 2.1) * 0.4
    }
  })

  const layout = useMemo(() => {
    const cols = isPortrait ? 2 : items.length <= 4 ? 2 : 3
    const rows = Math.ceil(items.length / cols)
    const spacing = geometry.parameters.width + 0.9
    const yGap = geometry.parameters.height + 0.6
    return items.map((_, i) => {
      const rnd = mulberry32(1000 + zoneIndex * 97 + i * 13)
      const col = i % cols
      const row = Math.floor(i / cols)
      return {
        pos: [
          (col - (cols - 1) / 2) * spacing + (rnd() - 0.5) * 0.4,
          ((rows - 1) / 2 - row) * yGap + (rnd() - 0.5) * 0.3,
          (rnd() - 0.5) * 2.4
        ] as [number, number, number],
        rot: [(rnd() - 0.5) * 0.08, (rnd() - 0.5) * 0.22, (rnd() - 0.5) * 0.05] as [number, number, number],
        phase: rnd() * Math.PI * 2
      }
    })
  }, [items, zoneIndex, isPortrait, geometry])

  return (
    <group ref={group} position={[0, 0, -zoneIndex * ZONE_GAP]}>
      {items.map((item, i) => (
        <FloatingCard
          key={item.id}
          item={item}
          position={layout[i].pos}
          rotation={layout[i].rot}
          phase={layout[i].phase}
          texture={textures?.[i] ?? null}
          geometry={geometry}
          edgeGeometry={edgeGeometry}
          accent={accent}
          onOpen={onOpen}
        />
      ))}
    </group>
  )
}
