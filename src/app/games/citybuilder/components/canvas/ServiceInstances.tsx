import * as THREE from 'three';
import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { GLTF } from 'three-stdlib';
import InstancedGLTFGroup, { InstanceTransform } from './InstancedGLTFGroup';

interface ServiceInstancesProps {
  transforms: InstanceTransform[];
  maxCount: number;
  ghost?: boolean;
}

// ---------- Police ----------
type PoliceGLTF = GLTF & {
  nodes: {
    Cube052: THREE.Mesh; Cube052_1: THREE.Mesh; Cube052_2: THREE.Mesh;
    Cube052_3: THREE.Mesh; Cube052_4: THREE.Mesh; Cube052_5: THREE.Mesh;
  };
  materials: {
    ['Material.242']: THREE.MeshStandardMaterial; ['Material.243']: THREE.MeshStandardMaterial;
    ['Material.244']: THREE.MeshStandardMaterial; ['Material.245']: THREE.MeshStandardMaterial;
    ['Material.246']: THREE.MeshStandardMaterial; ['Material.247']: THREE.MeshStandardMaterial;
  };
};

export function PoliceInstances({ transforms, maxCount, ghost }: ServiceInstancesProps) {
  const { nodes, materials } = useGLTF('/games/citybuilder/models/buildings/police.glb') as unknown as PoliceGLTF;

  const meshes = useMemo(() => [
    { geometry: nodes.Cube052.geometry, material: materials['Material.242'] },
    { geometry: nodes.Cube052_1.geometry, material: materials['Material.243'] },
    { geometry: nodes.Cube052_2.geometry, material: materials['Material.244'] },
    { geometry: nodes.Cube052_3.geometry, material: materials['Material.245'] },
    { geometry: nodes.Cube052_4.geometry, material: materials['Material.246'] },
    { geometry: nodes.Cube052_5.geometry, material: materials['Material.247'] },
  ], [nodes, materials]);

  return (
    <InstancedGLTFGroup meshes={meshes} transforms={transforms} maxCount={maxCount} localOffset={[0.17, -0.002, 0]} ghost={ghost} />
  );
}
useGLTF.preload('/games/citybuilder/models/buildings/police.glb');

// ---------- Hospital ----------
type HospitalGLTF = GLTF & {
  nodes: { Cube058: THREE.Mesh; Cube058_1: THREE.Mesh; Cube058_2: THREE.Mesh };
  materials: {
    ['Material.248']: THREE.MeshStandardMaterial; ['Material.249']: THREE.MeshStandardMaterial;
    ['Material.250']: THREE.MeshStandardMaterial;
  };
};

export function HospitalInstances({ transforms, maxCount, ghost }: ServiceInstancesProps) {
  const { nodes, materials } = useGLTF('/games/citybuilder/models/buildings/hospital.glb') as unknown as HospitalGLTF;

  const meshes = useMemo(() => [
    { geometry: nodes.Cube058.geometry, material: materials['Material.248'] },
    { geometry: nodes.Cube058_1.geometry, material: materials['Material.249'] },
    { geometry: nodes.Cube058_2.geometry, material: materials['Material.250'] },
  ], [nodes, materials]);

  return (
    <InstancedGLTFGroup meshes={meshes} transforms={transforms} maxCount={maxCount} localOffset={[0, -0.002, 0]} ghost={ghost} />
  );
}
useGLTF.preload('/games/citybuilder/models/buildings/hospital.glb');

// ---------- FireFighter ----------
type FireFighterGLTF = GLTF & {
  nodes: {
    Cube053: THREE.Mesh; Cube053_1: THREE.Mesh; Cube053_2: THREE.Mesh; Cube053_3: THREE.Mesh;
    Cube053_4: THREE.Mesh; Cube053_5: THREE.Mesh; Cube053_6: THREE.Mesh; Cube053_7: THREE.Mesh;
  };
  materials: {
    ['Material.258']: THREE.MeshStandardMaterial; ['Material.251']: THREE.MeshStandardMaterial;
    ['Material.252']: THREE.MeshStandardMaterial; ['Material.253']: THREE.MeshStandardMaterial;
    ['Material.254']: THREE.MeshStandardMaterial; ['Material.255']: THREE.MeshStandardMaterial;
    ['Material.256']: THREE.MeshStandardMaterial; ['Material.257']: THREE.MeshStandardMaterial;
  };
};

export function FireFighterInstances({ transforms, maxCount, ghost }: ServiceInstancesProps) {
  const { nodes, materials } = useGLTF('/games/citybuilder/models/buildings/firefighter.glb') as unknown as FireFighterGLTF;

  const meshes = useMemo(() => [
    { geometry: nodes.Cube053.geometry, material: materials['Material.258'] },
    { geometry: nodes.Cube053_1.geometry, material: materials['Material.251'] },
    { geometry: nodes.Cube053_2.geometry, material: materials['Material.252'] },
    { geometry: nodes.Cube053_3.geometry, material: materials['Material.253'] },
    { geometry: nodes.Cube053_4.geometry, material: materials['Material.254'] },
    { geometry: nodes.Cube053_5.geometry, material: materials['Material.255'] },
    { geometry: nodes.Cube053_6.geometry, material: materials['Material.256'] },
    { geometry: nodes.Cube053_7.geometry, material: materials['Material.257'] },
  ], [nodes, materials]);

  // Tidak ada wrapping <group position> di export asli -> offset nol
  return (
    <InstancedGLTFGroup meshes={meshes} transforms={transforms} maxCount={maxCount} localOffset={[0, 0, 0]} ghost={ghost} />
  );
}
useGLTF.preload('/games/citybuilder/models/buildings/firefighter.glb');