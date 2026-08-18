'use client'

import * as THREE from 'three'
import React from 'react'
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three-stdlib'
import { ThreeElements } from '@react-three/fiber';
import { CuboidCollider, RigidBody } from '@react-three/rapier';

type GLTFResult = GLTF & {
  nodes: {
    Cube013: THREE.Mesh
    Cube013_1: THREE.Mesh
    Cube013_2: THREE.Mesh
    Cube013_3: THREE.Mesh
    Cube013_4: THREE.Mesh
    Cube013_5: THREE.Mesh
    Cube013_6: THREE.Mesh
    Cube013_7: THREE.Mesh
    Cube013_8: THREE.Mesh
    Cube013_9: THREE.Mesh
    Cube013_10: THREE.Mesh
    Cube013_11: THREE.Mesh
    Cube013_12: THREE.Mesh
    Cube013_13: THREE.Mesh
    Cube013_14: THREE.Mesh
    Cube013_15: THREE.Mesh
    Cube013_16: THREE.Mesh
    Cube013_17: THREE.Mesh
    Cube013_18: THREE.Mesh
    Cube013_19: THREE.Mesh
    Cube013_20: THREE.Mesh
    Cube013_21: THREE.Mesh
    Cube013_22: THREE.Mesh
    Cube013_23: THREE.Mesh
    Cube013_24: THREE.Mesh
    Cube013_25: THREE.Mesh
    Cube013_26: THREE.Mesh
    Cube013_27: THREE.Mesh
    Cube013_28: THREE.Mesh
    Cube013_29: THREE.Mesh
    Cube013_30: THREE.Mesh
    Cube013_31: THREE.Mesh
    Cube013_32: THREE.Mesh
    Cube013_33: THREE.Mesh
    Cube013_34: THREE.Mesh
    Cube013_35: THREE.Mesh
    Cube013_36: THREE.Mesh
    Cube013_37: THREE.Mesh
    Cube013_38: THREE.Mesh
    Cube013_39: THREE.Mesh
    Cube013_40: THREE.Mesh
    Cube013_41: THREE.Mesh
    Cube013_42: THREE.Mesh
    Cube013_43: THREE.Mesh
    Cube013_44: THREE.Mesh
    Cube013_45: THREE.Mesh
    Cube013_46: THREE.Mesh
    Cube013_47: THREE.Mesh
    Cube013_48: THREE.Mesh
    Cube013_49: THREE.Mesh
    Cube013_50: THREE.Mesh
    Cube013_51: THREE.Mesh
    Cube013_52: THREE.Mesh
    Cube013_53: THREE.Mesh
    Cube013_54: THREE.Mesh
    Cube013_55: THREE.Mesh
    Cube013_56: THREE.Mesh
    Cube013_57: THREE.Mesh
  }
  materials: {
    ['Material.013']: THREE.MeshStandardMaterial
    ['Material.014']: THREE.MeshStandardMaterial
    ['Material.016']: THREE.MeshStandardMaterial
    ['Material.015']: THREE.MeshStandardMaterial
    ['Material.018']: THREE.MeshStandardMaterial
    ['Material.017']: THREE.MeshStandardMaterial
    ['Material.023']: THREE.MeshStandardMaterial
    ['Material.024']: THREE.MeshStandardMaterial
    ['Material.026']: THREE.MeshStandardMaterial
    ['Material.025']: THREE.MeshStandardMaterial
    ['Material.027']: THREE.MeshStandardMaterial
    ['Material.028']: THREE.MeshStandardMaterial
    ['Material.029']: THREE.MeshStandardMaterial
    ['Material.030']: THREE.MeshStandardMaterial
    ['Material.031']: THREE.MeshStandardMaterial
    ['Material.032']: THREE.MeshStandardMaterial
    ['Material.033']: THREE.MeshStandardMaterial
    ['Material.034']: THREE.MeshStandardMaterial
    ['Material.035']: THREE.MeshStandardMaterial
    ['Material.036']: THREE.MeshStandardMaterial
    ['Material.037']: THREE.MeshStandardMaterial
    ['Material.038']: THREE.MeshStandardMaterial
    ['Material.041']: THREE.MeshStandardMaterial
    ['Material.042']: THREE.MeshStandardMaterial
    ['Material.043']: THREE.MeshStandardMaterial
    ['Material.044']: THREE.MeshStandardMaterial
    ['Material.045']: THREE.MeshStandardMaterial
    ['Material.046']: THREE.MeshStandardMaterial
    ['Material.048']: THREE.MeshStandardMaterial
    ['Material.047']: THREE.MeshStandardMaterial
    ['Material.049']: THREE.MeshStandardMaterial
    ['Material.050']: THREE.MeshStandardMaterial
    ['Material.051']: THREE.MeshStandardMaterial
    ['Material.052']: THREE.MeshStandardMaterial
    ['Material.053']: THREE.MeshStandardMaterial
    ['Material.054']: THREE.MeshStandardMaterial
    ['Material.055']: THREE.MeshStandardMaterial
    ['Material.056']: THREE.MeshStandardMaterial
    ['Material.058']: THREE.MeshStandardMaterial
    ['Material.057']: THREE.MeshStandardMaterial
    ['Material.059']: THREE.MeshStandardMaterial
    ['Material.060']: THREE.MeshStandardMaterial
    ['Material.062']: THREE.MeshStandardMaterial
    ['Material.061']: THREE.MeshStandardMaterial
    ['Material.063']: THREE.MeshStandardMaterial
    ['Material.064']: THREE.MeshStandardMaterial
    ['Material.019']: THREE.MeshStandardMaterial
    ['Material.020']: THREE.MeshStandardMaterial
    ['Material.039']: THREE.MeshStandardMaterial
    ['Material.040']: THREE.MeshStandardMaterial
    ['Material.065']: THREE.MeshStandardMaterial
    ['Material.066']: THREE.MeshStandardMaterial
    ['Material.067']: THREE.MeshStandardMaterial
    ['Material.068']: THREE.MeshStandardMaterial
    ['Material.070']: THREE.MeshStandardMaterial
    ['Material.069']: THREE.MeshStandardMaterial
    ['Material.071']: THREE.MeshStandardMaterial
    ['Material.072']: THREE.MeshStandardMaterial
  }
}


export function TrackFence(props: any) {
  const { nodes, materials } = useGLTF('/games/fast-car/models/environments/Fence.glb') as any

  return (
    <group {...props} dispose={null}>
      <RigidBody type="fixed" colliders="trimesh">
      <group position={[-332.082, 2.316, 1175.617]} scale={[4, 1.2, 0.5]}>
        <mesh geometry={nodes.Cube013.geometry} material={materials['Material.013']} />
        <mesh geometry={nodes.Cube013_1.geometry} material={materials['Material.014']} />
        <mesh geometry={nodes.Cube013_2.geometry} material={materials['Material.016']} />
        <mesh geometry={nodes.Cube013_3.geometry} material={materials['Material.015']} />
        <mesh geometry={nodes.Cube013_4.geometry} material={materials['Material.018']} />
        <mesh geometry={nodes.Cube013_5.geometry} material={materials['Material.017']} />
        <mesh geometry={nodes.Cube013_6.geometry} material={materials['Material.023']} />
        <mesh geometry={nodes.Cube013_7.geometry} material={materials['Material.024']} />
        <mesh geometry={nodes.Cube013_8.geometry} material={materials['Material.026']} />
        <mesh geometry={nodes.Cube013_9.geometry} material={materials['Material.025']} />
        <mesh geometry={nodes.Cube013_10.geometry} material={materials['Material.027']} />
        <mesh geometry={nodes.Cube013_11.geometry} material={materials['Material.028']} />
        <mesh geometry={nodes.Cube013_12.geometry} material={materials['Material.029']} />
        <mesh geometry={nodes.Cube013_13.geometry} material={materials['Material.030']} />
        <mesh geometry={nodes.Cube013_14.geometry} material={materials['Material.031']} />
        <mesh geometry={nodes.Cube013_15.geometry} material={materials['Material.032']} />
        <mesh geometry={nodes.Cube013_16.geometry} material={materials['Material.033']} />
        <mesh geometry={nodes.Cube013_17.geometry} material={materials['Material.034']} />
        <mesh geometry={nodes.Cube013_18.geometry} material={materials['Material.035']} />
        <mesh geometry={nodes.Cube013_19.geometry} material={materials['Material.036']} />
        <mesh geometry={nodes.Cube013_20.geometry} material={materials['Material.037']} />
        <mesh geometry={nodes.Cube013_21.geometry} material={materials['Material.038']} />
        <mesh geometry={nodes.Cube013_22.geometry} material={materials['Material.041']} />
        <mesh geometry={nodes.Cube013_23.geometry} material={materials['Material.042']} />
        <mesh geometry={nodes.Cube013_24.geometry} material={materials['Material.043']} />
        <mesh geometry={nodes.Cube013_25.geometry} material={materials['Material.044']} />
        <mesh geometry={nodes.Cube013_26.geometry} material={materials['Material.045']} />
        <mesh geometry={nodes.Cube013_27.geometry} material={materials['Material.046']} />
        <mesh geometry={nodes.Cube013_28.geometry} material={materials['Material.048']} />
        <mesh geometry={nodes.Cube013_29.geometry} material={materials['Material.047']} />
        <mesh geometry={nodes.Cube013_30.geometry} material={materials['Material.049']} />
        <mesh geometry={nodes.Cube013_31.geometry} material={materials['Material.050']} />
        <mesh geometry={nodes.Cube013_32.geometry} material={materials['Material.051']} />
        <mesh geometry={nodes.Cube013_33.geometry} material={materials['Material.052']} />
        <mesh geometry={nodes.Cube013_34.geometry} material={materials['Material.053']} />
        <mesh geometry={nodes.Cube013_35.geometry} material={materials['Material.054']} />
        <mesh geometry={nodes.Cube013_36.geometry} material={materials['Material.055']} />
        <mesh geometry={nodes.Cube013_37.geometry} material={materials['Material.056']} />
        <mesh geometry={nodes.Cube013_38.geometry} material={materials['Material.058']} />
        <mesh geometry={nodes.Cube013_39.geometry} material={materials['Material.057']} />
        <mesh geometry={nodes.Cube013_40.geometry} material={materials['Material.059']} />
        <mesh geometry={nodes.Cube013_41.geometry} material={materials['Material.060']} />
        <mesh geometry={nodes.Cube013_42.geometry} material={materials['Material.062']} />
        <mesh geometry={nodes.Cube013_43.geometry} material={materials['Material.061']} />
        <mesh geometry={nodes.Cube013_44.geometry} material={materials['Material.063']} />
        <mesh geometry={nodes.Cube013_45.geometry} material={materials['Material.064']} />
        <mesh geometry={nodes.Cube013_46.geometry} material={materials['Material.019']} />
        <mesh geometry={nodes.Cube013_47.geometry} material={materials['Material.020']} />
        <mesh geometry={nodes.Cube013_48.geometry} material={materials['Material.039']} />
        <mesh geometry={nodes.Cube013_49.geometry} material={materials['Material.040']} />
        <mesh geometry={nodes.Cube013_50.geometry} material={materials['Material.065']} />
        <mesh geometry={nodes.Cube013_51.geometry} material={materials['Material.066']} />
        <mesh geometry={nodes.Cube013_52.geometry} material={materials['Material.067']} />
        <mesh geometry={nodes.Cube013_53.geometry} material={materials['Material.068']} />
        <mesh geometry={nodes.Cube013_54.geometry} material={materials['Material.070']} />
        <mesh geometry={nodes.Cube013_55.geometry} material={materials['Material.069']} />
        <mesh geometry={nodes.Cube013_56.geometry} material={materials['Material.071']} />
        <mesh geometry={nodes.Cube013_57.geometry} material={materials['Material.072']} />
      </group>
    </RigidBody>
    </group>
  )
}

useGLTF.preload('/games/fast-car/models/environments/Fence.glb')