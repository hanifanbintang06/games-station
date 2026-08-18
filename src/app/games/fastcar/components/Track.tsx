'use client'

import * as THREE from 'three'
import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three-stdlib'
import { ThreeElements } from '@react-three/fiber';
import { CuboidCollider, RigidBody } from '@react-three/rapier';

type GLTFResult = GLTF & {
  nodes: {
    Cube009: THREE.Mesh
    Cube009_1: THREE.Mesh
    Cube009_2: THREE.Mesh
  }
  materials: {
    ['Aspal.001']: THREE.MeshStandardMaterial
    ['Tikungan.001']: THREE.MeshStandardMaterial
    ['Tikungan.002']: THREE.MeshStandardMaterial
  }
}

export function Track(props: ThreeElements['group']) {
  // Melakukan double casting (as unknown as GLTFResult) untuk menjembatani konversi tipe data
  const { nodes, materials } = useGLTF('/games/fast-car/models/tracks/sirkuit1.glb') as unknown as GLTFResult
  
  return (
    <group {...props} dispose={null}>
      <group position={[-314.796, 1.025, 1197.251]} rotation={[0, 0.07, 0]}>
        <RigidBody type="fixed" colliders={false} restitution={0} friction={1}> 
          <mesh
            geometry={nodes.Cube009.geometry}
            material={materials['Aspal.001']}
          />
          <mesh
            geometry={nodes.Cube009_1.geometry}
            material={materials['Tikungan.001']}
          />
          <mesh
            geometry={nodes.Cube009_2.geometry}
            material={materials['Tikungan.002']}
          />
          <CuboidCollider args={[500, 1, 500]} position={[0, -1, 0]} />
        </RigidBody>
      </group>
    </group>
  )
}

// Path preload disamakan dengan path pemanggilan aset di atas
useGLTF.preload('/games/fast-car/models/tracks/sirkuit1.glb')