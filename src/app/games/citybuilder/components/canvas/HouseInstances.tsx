import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { GLTF } from 'three-stdlib';
import InstancedGLTFGroup, { InstanceTransform } from './InstancedGLTFGroup';
import { useMemo } from 'react';

interface HouseInstancesProps {
  transforms: InstanceTransform[];
  maxCount: number;
  ghost?: boolean;
}

// ---------- House1 ----------
type House1GLTF = GLTF & {
  nodes: {
    Cube033_1: THREE.Mesh; Cube033_2: THREE.Mesh; Cube033_3: THREE.Mesh; Cube033_4: THREE.Mesh;
    Cube033_5: THREE.Mesh; Cube033_6: THREE.Mesh; Cube033_7: THREE.Mesh; Cube033_8: THREE.Mesh;
    Cube033_9: THREE.Mesh; Cube033_10: THREE.Mesh; Cube033_11: THREE.Mesh;
  };
  materials: {
    ['Material.082']: THREE.MeshStandardMaterial; ['Material.083']: THREE.MeshStandardMaterial;
    ['Material.081']: THREE.MeshStandardMaterial; ['Material.080']: THREE.MeshStandardMaterial;
    ['Material.079']: THREE.MeshStandardMaterial; ['Material.078']: THREE.MeshStandardMaterial;
    ['Material.077']: THREE.MeshStandardMaterial; ['Material.076']: THREE.MeshStandardMaterial;
    ['Material.074']: THREE.MeshStandardMaterial; ['Material.073']: THREE.MeshStandardMaterial;
    ['Material.075']: THREE.MeshStandardMaterial;
  };
};

export function House1Instances({ transforms, maxCount, ghost }: HouseInstancesProps) {
  const { nodes, materials } = useGLTF('/games/citybuilder/models/buildings/house1.glb') as unknown as House1GLTF;

  const meshes = useMemo(() => [
    { geometry: nodes.Cube033_1.geometry, material: materials['Material.082'] },
    { geometry: nodes.Cube033_2.geometry, material: materials['Material.083'] },
    { geometry: nodes.Cube033_3.geometry, material: materials['Material.081'] },
    { geometry: nodes.Cube033_4.geometry, material: materials['Material.080'] },
    { geometry: nodes.Cube033_5.geometry, material: materials['Material.079'] },
    { geometry: nodes.Cube033_6.geometry, material: materials['Material.078'] },
    { geometry: nodes.Cube033_7.geometry, material: materials['Material.077'] },
    { geometry: nodes.Cube033_8.geometry, material: materials['Material.076'] },
    { geometry: nodes.Cube033_9.geometry, material: materials['Material.074'] },
    { geometry: nodes.Cube033_10.geometry, material: materials['Material.073'] },
    { geometry: nodes.Cube033_11.geometry, material: materials['Material.075'] },
  ], [nodes, materials]);

  return (
    <InstancedGLTFGroup meshes={meshes} transforms={transforms} maxCount={maxCount} localOffset={[0, 0.5, 0]} ghost={ghost} />
  );
}
useGLTF.preload('/games/citybuilder/models/buildings/house1.glb');

// ---------- House2 ----------
type House2GLTF = GLTF & {
  nodes: {
    Cube026: THREE.Mesh; Cube026_1: THREE.Mesh; Cube026_2: THREE.Mesh; Cube026_3: THREE.Mesh;
    Cube026_4: THREE.Mesh; Cube026_5: THREE.Mesh; Cube026_6: THREE.Mesh; Cube026_7: THREE.Mesh;
    Cube026_8: THREE.Mesh; Cube026_9: THREE.Mesh; Cube026_10: THREE.Mesh;
  };
  materials: {
    ['Material.109']: THREE.MeshStandardMaterial; ['Material.108']: THREE.MeshStandardMaterial;
    ['Material.107']: THREE.MeshStandardMaterial; ['Material.106']: THREE.MeshStandardMaterial;
    ['Material.105']: THREE.MeshStandardMaterial; ['Material.104']: THREE.MeshStandardMaterial;
    ['Material.103']: THREE.MeshStandardMaterial; ['Material.102']: THREE.MeshStandardMaterial;
    ['Material.101']: THREE.MeshStandardMaterial; ['Material.068']: THREE.MeshStandardMaterial;
    ['Material.063']: THREE.MeshStandardMaterial;
  };
};

export function House2Instances({ transforms, maxCount, ghost }: HouseInstancesProps) {
  const { nodes, materials } = useGLTF('/games/citybuilder/models/buildings/house2.glb') as unknown as House2GLTF;

  const meshes = useMemo(() => [
    { geometry: nodes.Cube026.geometry, material: materials['Material.109'] },
    { geometry: nodes.Cube026_1.geometry, material: materials['Material.108'] },
    { geometry: nodes.Cube026_2.geometry, material: materials['Material.107'] },
    { geometry: nodes.Cube026_3.geometry, material: materials['Material.106'] },
    { geometry: nodes.Cube026_4.geometry, material: materials['Material.105'] },
    { geometry: nodes.Cube026_5.geometry, material: materials['Material.104'] },
    { geometry: nodes.Cube026_6.geometry, material: materials['Material.103'] },
    { geometry: nodes.Cube026_7.geometry, material: materials['Material.102'] },
    { geometry: nodes.Cube026_8.geometry, material: materials['Material.101'] },
    { geometry: nodes.Cube026_9.geometry, material: materials['Material.068'] },
    { geometry: nodes.Cube026_10.geometry, material: materials['Material.063'] },
  ], [nodes, materials]);

  return (
    <InstancedGLTFGroup meshes={meshes} transforms={transforms} maxCount={maxCount} localOffset={[0, 0.5, 0]} ghost={ghost} />
  );
}
useGLTF.preload('/games/citybuilder/models/buildings/house2.glb');

// ---------- House3 ----------
type House3GLTF = GLTF & {
  nodes: {
    Cube042: THREE.Mesh; Cube042_1: THREE.Mesh; Cube042_2: THREE.Mesh; Cube042_3: THREE.Mesh;
    Cube042_4: THREE.Mesh; Cube042_5: THREE.Mesh; Cube042_6: THREE.Mesh; Cube042_7: THREE.Mesh;
    Cube042_8: THREE.Mesh; Cube042_9: THREE.Mesh;
  };
  materials: {
    ['Material.113']: THREE.MeshStandardMaterial; ['Material.115']: THREE.MeshStandardMaterial;
    ['Material.116']: THREE.MeshStandardMaterial; ['Material.114']: THREE.MeshStandardMaterial;
    ['Material.117']: THREE.MeshStandardMaterial; ['Material.118']: THREE.MeshStandardMaterial;
    ['Material.119']: THREE.MeshStandardMaterial; ['Material.110']: THREE.MeshStandardMaterial;
    ['Material.111']: THREE.MeshStandardMaterial; ['Material.112']: THREE.MeshStandardMaterial;
  };
};

export function House3Instances({ transforms, maxCount, ghost }: HouseInstancesProps) {
  const { nodes, materials } = useGLTF('/games/citybuilder/models/buildings/house3.glb') as unknown as House3GLTF;

  const meshes = useMemo(() => [
    { geometry: nodes.Cube042.geometry, material: materials['Material.113'] },
    { geometry: nodes.Cube042_1.geometry, material: materials['Material.115'] },
    { geometry: nodes.Cube042_2.geometry, material: materials['Material.116'] },
    { geometry: nodes.Cube042_3.geometry, material: materials['Material.114'] },
    { geometry: nodes.Cube042_4.geometry, material: materials['Material.117'] },
    { geometry: nodes.Cube042_5.geometry, material: materials['Material.118'] },
    { geometry: nodes.Cube042_6.geometry, material: materials['Material.119'] },
    { geometry: nodes.Cube042_7.geometry, material: materials['Material.110'] },
    { geometry: nodes.Cube042_8.geometry, material: materials['Material.111'] },
    { geometry: nodes.Cube042_9.geometry, material: materials['Material.112'] },
  ], [nodes, materials]);

  // House3 nggak punya inner group offset (langsung <mesh> di root), jadi localOffset [0,0,0]
  return (
    <InstancedGLTFGroup meshes={meshes} transforms={transforms} maxCount={maxCount} localOffset={[0, 0, 0]} ghost={ghost} />
  );
}
useGLTF.preload('/games/citybuilder/models/buildings/house3.glb');