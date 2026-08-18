import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { GLTF } from 'three-stdlib';
import InstancedGLTFGroup, { InstanceTransform } from './InstancedGLTFGroup';
import { useMemo } from 'react';

interface CommercialInstancesProps {
  transforms: InstanceTransform[];
  maxCount: number;
  ghost?: boolean;
}

// ---------- Warteg ----------
type WartegGLTF = GLTF & {
  nodes: {
    Cube041: THREE.Mesh; Cube041_1: THREE.Mesh; Cube041_2: THREE.Mesh;
    Cube041_3: THREE.Mesh; Cube041_4: THREE.Mesh;
  };
  materials: {
    ['Material.129']: THREE.MeshStandardMaterial; ['Material.125']: THREE.MeshStandardMaterial;
    ['Material.126']: THREE.MeshStandardMaterial; ['Material.127']: THREE.MeshStandardMaterial;
    ['Material.128']: THREE.MeshStandardMaterial;
  };
};

export function WartegInstances({ transforms, maxCount, ghost }: CommercialInstancesProps) {
  const { nodes, materials } = useGLTF('/games/citybuilder/models/buildings/warteg.glb') as unknown as WartegGLTF;

  const meshes = useMemo(() => [
    { geometry: nodes.Cube041.geometry, material: materials['Material.129'] },
    { geometry: nodes.Cube041_1.geometry, material: materials['Material.125'] },
    { geometry: nodes.Cube041_2.geometry, material: materials['Material.126'] },
    { geometry: nodes.Cube041_3.geometry, material: materials['Material.127'] },
    { geometry: nodes.Cube041_4.geometry, material: materials['Material.128'] },
  ], [nodes, materials]);

  return (
    <InstancedGLTFGroup meshes={meshes} transforms={transforms} maxCount={maxCount} localOffset={[0, 0, 0]} ghost={ghost} />
  );
}
useGLTF.preload('/games/citybuilder/models/buildings/warteg.glb');

// ---------- Market ----------
type MarketGLTF = GLTF & {
  nodes: {
    Cube038: THREE.Mesh; Cube038_1: THREE.Mesh; Cube038_2: THREE.Mesh;
    Cube038_3: THREE.Mesh; Cube038_4: THREE.Mesh;
  };
  materials: {
    ['Material.062']: THREE.MeshStandardMaterial; ['Material.030']: THREE.MeshStandardMaterial;
    ['Material.031']: THREE.MeshStandardMaterial; ['Material.032']: THREE.MeshStandardMaterial;
    ['Material.033']: THREE.MeshStandardMaterial;
  };
};

export function MarketInstances({ transforms, maxCount, ghost }: CommercialInstancesProps) {
  const { nodes, materials } = useGLTF('/games/citybuilder/models/buildings/market.glb') as unknown as MarketGLTF;

  const meshes = useMemo(() => [
    { geometry: nodes.Cube038.geometry, material: materials['Material.062'] },
    { geometry: nodes.Cube038_1.geometry, material: materials['Material.030'] },
    { geometry: nodes.Cube038_2.geometry, material: materials['Material.031'] },
    { geometry: nodes.Cube038_3.geometry, material: materials['Material.032'] },
    { geometry: nodes.Cube038_4.geometry, material: materials['Material.033'] },
  ], [nodes, materials]);

  return (
    <InstancedGLTFGroup meshes={meshes} transforms={transforms} maxCount={maxCount} localOffset={[0, 0, 0]} ghost={ghost} />
  );
}
useGLTF.preload('/games/citybuilder/models/buildings/market.glb');