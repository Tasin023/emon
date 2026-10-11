import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function Particles({ count, accent }: { count: number; accent: string }) {
  const ref = useRef<THREE.Points>(null!)

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 34
      arr[i * 3 + 1] = (Math.random() - 0.5) * 18
      arr[i * 3 + 2] = 14 - Math.random() * 100 // spread across all three zones
    }
    return arr
  }, [count])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (!ref.current) return
    ref.current.rotation.y = Math.sin(t * 0.02) * 0.06
    ref.current.position.y = Math.sin(t * 0.05) * 0.6
  })

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color={accent}
        transparent
        opacity={0.5}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}
