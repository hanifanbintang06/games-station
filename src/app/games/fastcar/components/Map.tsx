'use client'

import * as THREE from 'three'
import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three-stdlib'
import { ThreeElements } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';

type GLTFResult = GLTF & {
  nodes: {
    Plane001: THREE.Mesh
    Plane001_1: THREE.Mesh
    Plane001_2: THREE.Mesh
  }
  materials: {
    ['Material.006']: THREE.MeshStandardMaterial
    ['Material.007']: THREE.MeshStandardMaterial
    ['Material.008']: THREE.MeshStandardMaterial
  }
}

export function Map(props: ThreeElements['group']) {
  const { nodes, materials } = useGLTF('/games/fast-car/models/maps/sirkuit1-land.glb') as unknown as GLTFResult
  return (
    <group {...props} dispose={null}>
      <group position={[11.984, 0.8, 573.659]} scale={[1387.698, 124.715, 1075.755]}>
      <RigidBody type="fixed" colliders="trimesh" restitution={0} friction={1}> 
        <mesh
          geometry={nodes.Plane001.geometry}
          material={materials['Material.006']}
        />
        <mesh
          geometry={nodes.Plane001_1.geometry}
          material={materials['Material.007']}
        />
        <mesh
          geometry={nodes.Plane001_2.geometry}
          material={materials['Material.008']}
        />
        </RigidBody>
      </group>
    </group>
  )
}

useGLTF.preload('/games/fast-car/models/maps/sirkuit1-land.glb')
