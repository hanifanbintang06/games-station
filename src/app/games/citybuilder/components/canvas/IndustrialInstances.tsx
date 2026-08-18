import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { GLTF } from 'three-stdlib';
import InstancedGLTFGroup, { InstanceTransform } from './InstancedGLTFGroup';
import { useMemo } from 'react';

interface IndustrialInstancesProps {
  transforms: InstanceTransform[];
  maxCount: number;
  ghost?: boolean;
}

// ---------- Factory1 ----------
type Factory1GLTF = GLTF & {
  nodes: {
    Cube044: THREE.Mesh; Cube044_1: THREE.Mesh; Cube044_2: THREE.Mesh; Cube044_3: THREE.Mesh;
    Cube044_4: THREE.Mesh; Cube044_5: THREE.Mesh; Cube044_6: THREE.Mesh; Cube044_7: THREE.Mesh;
  };
  materials: {
    ['Material.137']: THREE.MeshStandardMaterial; ['Material.130']: THREE.MeshStandardMaterial;
    ['Material.131']: THREE.MeshStandardMaterial; ['Material.132']: THREE.MeshStandardMaterial;
    ['Material.133']: THREE.MeshStandardMaterial; ['Material.134']: THREE.MeshStandardMaterial;
    ['Material.135']: THREE.MeshStandardMaterial; ['Material.136']: THREE.MeshStandardMaterial;
  };
};

export function Factory1Instances({ transforms, maxCount, ghost }: IndustrialInstancesProps) {
  const { nodes, materials } = useGLTF('/games/citybuilder/models/buildings/factory1.glb') as unknown as Factory1GLTF;

  const meshes = useMemo(() => [
    { geometry: nodes.Cube044.geometry, material: materials['Material.137'] },
    { geometry: nodes.Cube044_1.geometry, material: materials['Material.130'] },
    { geometry: nodes.Cube044_2.geometry, material: materials['Material.131'] },
    { geometry: nodes.Cube044_3.geometry, material: materials['Material.132'] },
    { geometry: nodes.Cube044_4.geometry, material: materials['Material.133'] },
    { geometry: nodes.Cube044_5.geometry, material: materials['Material.134'] },
    { geometry: nodes.Cube044_6.geometry, material: materials['Material.135'] },
    { geometry: nodes.Cube044_7.geometry, material: materials['Material.136'] },
  ], [nodes, materials]);

  return (
    <InstancedGLTFGroup meshes={meshes} transforms={transforms} maxCount={maxCount} localOffset={[0, 0, 0]} ghost={ghost} />
  );
}
useGLTF.preload('/games/citybuilder/models/buildings/factory1.glb');

// ---------- Factory2 ----------
type Factory2GLTF = GLTF & {
  nodes: {
    Cube046: THREE.Mesh; Cube046_1: THREE.Mesh; Cube046_2: THREE.Mesh; Cube046_3: THREE.Mesh;
    Cube046_4: THREE.Mesh; Cube046_5: THREE.Mesh; Cube046_6: THREE.Mesh; Cube046_7: THREE.Mesh;
  };
  materials: {
    ['Material.145']: THREE.MeshStandardMaterial; ['Material.138']: THREE.MeshStandardMaterial;
    ['Material.139']: THREE.MeshStandardMaterial; ['Material.140']: THREE.MeshStandardMaterial;
    ['Material.141']: THREE.MeshStandardMaterial; ['Material.142']: THREE.MeshStandardMaterial;
    ['Material.143']: THREE.MeshStandardMaterial; ['Material.144']: THREE.MeshStandardMaterial;
  };
};

export function Factory2Instances({ transforms, maxCount, ghost }: IndustrialInstancesProps) {
  const { nodes, materials } = useGLTF('/games/citybuilder/models/buildings/factory2.glb') as unknown as Factory2GLTF;

  const meshes = useMemo(() => [
    { geometry: nodes.Cube046.geometry, material: materials['Material.145'] },
    { geometry: nodes.Cube046_1.geometry, material: materials['Material.138'] },
    { geometry: nodes.Cube046_2.geometry, material: materials['Material.139'] },
    { geometry: nodes.Cube046_3.geometry, material: materials['Material.140'] },
    { geometry: nodes.Cube046_4.geometry, material: materials['Material.141'] },
    { geometry: nodes.Cube046_5.geometry, material: materials['Material.142'] },
    { geometry: nodes.Cube046_6.geometry, material: materials['Material.143'] },
    { geometry: nodes.Cube046_7.geometry, material: materials['Material.144'] },
  ], [nodes, materials]);

  return (
    <InstancedGLTFGroup meshes={meshes} transforms={transforms} maxCount={maxCount} localOffset={[0, 0, 0]} ghost={ghost} />
  );
}
useGLTF.preload('/games/citybuilder/models/buildings/factory2.glb');