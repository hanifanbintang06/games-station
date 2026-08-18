'use client'

import * as THREE from 'three'
import React, { forwardRef, useMemo } from 'react' // Tambahkan useMemo
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three-stdlib'
import { RapierRigidBody, RigidBody } from '@react-three/rapier'

type GLTFResult = GLTF & {
  nodes: {
    Bandepan: THREE.Mesh
  }
  materials: {
    Ban: THREE.MeshStandardMaterial
  }
}

export const Wheel = forwardRef<RapierRigidBody, {}>(
  (props, ref) => {
    const { nodes, materials } = useGLTF('/games/fast-car/models/cars/ban.glb') as unknown as GLTFResult
    
    // FUNGSI KUNCI: Memaksa titik pivot (origin) tepat ke tengah karet ban
    useMemo(() => {
      if (nodes.Bandepan.geometry) {
        nodes.Bandepan.geometry.center()
      }
    }, [nodes])
    
    return (
      <RigidBody 
        ref={ref}
        colliders="ball" 
        type="dynamic"
        mass={15} // Pastikan massa cukup berat agar stabil
        canSleep={false}
        restitution={0} // Absolut: Menghilangkan gaya pantul karet
        friction={1.5}  // Daya cengkeram ke aspal agar putaran lebih presisi
      >
        <mesh 
          geometry={nodes.Bandepan.geometry} 
          material={materials.Ban} 
          // Jika ban berubah arah setelah di-center, sesuaikan rotasi di sini
          rotation={[Math.PI / 2, 0, 0]}
          scale={[0.74, 0.503, 0.74]} 
        />
      </RigidBody>
    )
  }
)

useGLTF.preload('/games/fast-car/models/cars/ban.glb')