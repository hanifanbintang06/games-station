import * as THREE from 'three';
import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { GLTF } from 'three-stdlib';
import InstancedGLTFGroup, { InstanceTransform } from './InstancedGLTFGroup';

interface CommercialL2InstancesProps {
  transforms: InstanceTransform[];
  maxCount: number;
  ghost?: boolean;
}

// ---------- SuperMarket ----------
type SuperMarketGLTF = GLTF & {
  nodes: {
    Cube070: THREE.Mesh; Cube070_1: THREE.Mesh; Cube070_2: THREE.Mesh; Cube070_3: THREE.Mesh;
    Cube070_4: THREE.Mesh; Cube070_5: THREE.Mesh; Cube070_6: THREE.Mesh;
  };
  materials: {
    ['Material.357']: THREE.MeshStandardMaterial; ['Material.358']: THREE.MeshStandardMaterial;
    ['Material.359']: THREE.MeshStandardMaterial; ['Material.360']: THREE.MeshStandardMaterial;
    ['Material.361']: THREE.MeshStandardMaterial; ['Material.362']: THREE.MeshStandardMaterial;
    ['Material.363']: THREE.MeshStandardMaterial;
  };
};

export function SuperMarketInstances({ transforms, maxCount, ghost }: CommercialL2InstancesProps) {
  const { nodes, materials } = useGLTF('/games/citybuilder/models/buildings/supermarket.glb') as unknown as SuperMarketGLTF;

  const meshes = useMemo(() => [
    { geometry: nodes.Cube070.geometry, material: materials['Material.357'] },
    { geometry: nodes.Cube070_1.geometry, material: materials['Material.358'] },
    { geometry: nodes.Cube070_2.geometry, material: materials['Material.359'] },
    { geometry: nodes.Cube070_3.geometry, material: materials['Material.360'] },
    { geometry: nodes.Cube070_4.geometry, material: materials['Material.361'] },
    { geometry: nodes.Cube070_5.geometry, material: materials['Material.362'] },
    { geometry: nodes.Cube070_6.geometry, material: materials['Material.363'] },
  ], [nodes, materials]);

  // Model asli punya group offset [0, 0.05, 0]
  return (
    <InstancedGLTFGroup meshes={meshes} transforms={transforms} maxCount={maxCount} localOffset={[0, 0.05, 0]} ghost={ghost} />
  );
}
useGLTF.preload('/games/citybuilder/models/buildings/supermarket.glb');

// ---------- Shop ----------
type ShopGLTF = GLTF & {
  nodes: {
    Cube073: THREE.Mesh; Cube073_1: THREE.Mesh; Cube073_2: THREE.Mesh; Cube073_3: THREE.Mesh;
    Cube073_4: THREE.Mesh; Cube073_5: THREE.Mesh; Cube073_6: THREE.Mesh; Cube073_7: THREE.Mesh;
  };
  materials: {
    ['Material.364']: THREE.MeshStandardMaterial; ['Material.365']: THREE.MeshStandardMaterial;
    ['Material.366']: THREE.MeshStandardMaterial; ['Material.367']: THREE.MeshStandardMaterial;
    ['Material.368']: THREE.MeshStandardMaterial; ['Material.373']: THREE.MeshStandardMaterial;
    ['Material.374']: THREE.MeshStandardMaterial; ['Material.376']: THREE.MeshStandardMaterial;
  };
};

export function ShopInstances({ transforms, maxCount, ghost }: CommercialL2InstancesProps) {
  const { nodes, materials } = useGLTF('/games/citybuilder/models/buildings/shop.glb') as unknown as ShopGLTF;

  const meshes = useMemo(() => [
    { geometry: nodes.Cube073.geometry, material: materials['Material.364'] },
    { geometry: nodes.Cube073_1.geometry, material: materials['Material.365'] },
    { geometry: nodes.Cube073_2.geometry, material: materials['Material.366'] },
    { geometry: nodes.Cube073_3.geometry, material: materials['Material.367'] },
    { geometry: nodes.Cube073_4.geometry, material: materials['Material.368'] },
    { geometry: nodes.Cube073_5.geometry, material: materials['Material.373'] },
    { geometry: nodes.Cube073_6.geometry, material: materials['Material.374'] },
    { geometry: nodes.Cube073_7.geometry, material: materials['Material.376'] },
  ], [nodes, materials]);

  return (
    <InstancedGLTFGroup meshes={meshes} transforms={transforms} maxCount={maxCount} localOffset={[0, 0.05, 0]} ghost={ghost} />
  );
}
useGLTF.preload('/games/citybuilder/models/buildings/shop.glb');