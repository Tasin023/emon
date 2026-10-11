import { useEffect, useMemo } from 'react'
import { AdaptiveDpr } from '@react-three/drei'
import * as THREE from 'three'
import type { AnyItem, FocusTarget, ZoneData } from '../../types'
import { CameraRig } from './CameraRig'
import { Particles } from './Particles'
import { Zone } from './Zone'

interface Props {
  zones: ZoneData[]
  activeZone: number
  textures: (THREE.Texture | null)[]
  focus: FocusTarget | null
  resetToken: number
  onOpen: (item: AnyItem, worldPos: [number, number, number]) => void
  accent: string
  bg: string
  particleCount: number
}

export function Scene({
  zones,
  activeZone,
  textures,
  focus,
  resetToken,
  onOpen,
  accent,
  bg,
  particleCount
}: Props) {
  const active = zones[activeZone]

  // one shared geometry set per zone type — disposed on switch
  const geo = useMemo(() => new THREE.PlaneGeometry(active.width, active.height), [active])
  const edgeGeo = useMemo(() => new THREE.EdgesGeometry(geo), [geo])
  useEffect(() => {
    return () => {
      geo.dispose()
      edgeGeo.dispose()
    }
  }, [geo, edgeGeo])

  return (
    <>
      <color attach="background" args={[bg]} />
      {/* fog hides the zone boundaries; flights reveal each gallery cinematically */}
      <fog attach="fog" args={[bg, 10, 40]} />
      <AdaptiveDpr />
      <CameraRig activeZone={activeZone} focus={focus} resetToken={resetToken} />
      <Particles count={particleCount} accent={accent} />
      <Zone
        zoneIndex={activeZone}
        items={active.items}
        textures={textures}
        geometry={geo}
        edgeGeometry={edgeGeo}
        accent={accent}
        onOpen={onOpen}
      />
    </>
  )
}
