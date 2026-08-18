import * as THREE from 'three';
import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { GLTF } from 'three-stdlib';
import InstancedGLTFGroup, { InstanceTransform } from './InstancedGLTFGroup';

interface EducationInstancesProps {
  transforms: InstanceTransform[];
  maxCount: number;
  ghost?: boolean;
}

// ---------- SchoolElementary ----------
type SchoolElementaryGLTF = GLTF & {
  nodes: {
    Cube068: THREE.Mesh; Cube068_1: THREE.Mesh; Cube068_2: THREE.Mesh; Cube068_3: THREE.Mesh;
    Cube068_4: THREE.Mesh; Cube068_5: THREE.Mesh; Cube068_6: THREE.Mesh; Cube068_7: THREE.Mesh;
    Cube068_8: THREE.Mesh; Cube068_9: THREE.Mesh;
  };
  materials: {
    ['Material.281']: THREE.MeshStandardMaterial; ['Material.272']: THREE.MeshStandardMaterial;
    ['Material.273']: THREE.MeshStandardMaterial; ['Material.274']: THREE.MeshStandardMaterial;
    ['Material.275']: THREE.MeshStandardMaterial; ['Material.276']: THREE.MeshStandardMaterial;
    ['Material.277']: THREE.MeshStandardMaterial; ['Material.279']: THREE.MeshStandardMaterial;
    ['Material.278']: THREE.MeshStandardMaterial; ['Material.280']: THREE.MeshStandardMaterial;
  };
};

export function SchoolElementaryInstances({ transforms, maxCount, ghost }: EducationInstancesProps) {
  const { nodes, materials } = useGLTF('/games/citybuilder/models/buildings/school-elementary.glb') as unknown as SchoolElementaryGLTF;

  const meshes = useMemo(() => [
    { geometry: nodes.Cube068.geometry, material: materials['Material.281'] },
    { geometry: nodes.Cube068_1.geometry, material: materials['Material.272'] },
    { geometry: nodes.Cube068_2.geometry, material: materials['Material.273'] },
    { geometry: nodes.Cube068_3.geometry, material: materials['Material.274'] },
    { geometry: nodes.Cube068_4.geometry, material: materials['Material.275'] },
    { geometry: nodes.Cube068_5.geometry, material: materials['Material.276'] },
    { geometry: nodes.Cube068_6.geometry, material: materials['Material.277'] },
    { geometry: nodes.Cube068_7.geometry, material: materials['Material.279'] },
    { geometry: nodes.Cube068_8.geometry, material: materials['Material.278'] },
    { geometry: nodes.Cube068_9.geometry, material: materials['Material.280'] },
  ], [nodes, materials]);

  // Model asli punya group offset [0, -0.002, 0] -> localOffset sama
  return (
    <InstancedGLTFGroup meshes={meshes} transforms={transforms} maxCount={maxCount} localOffset={[0, -0.002, 0]} ghost={ghost} />
  );
}
useGLTF.preload('/games/citybuilder/models/buildings/school-elementary.glb');

// ---------- SchoolJunior ----------
type SchoolJuniorGLTF = GLTF & {
  nodes: {
    Cube061: THREE.Mesh; Cube061_1: THREE.Mesh; Cube061_2: THREE.Mesh; Cube061_3: THREE.Mesh;
    Cube061_4: THREE.Mesh; Cube061_5: THREE.Mesh; Cube061_6: THREE.Mesh; Cube061_7: THREE.Mesh;
    Cube061_8: THREE.Mesh; Cube061_9: THREE.Mesh; Cube061_10: THREE.Mesh; Cube061_11: THREE.Mesh;
    Cube061_12: THREE.Mesh; Cube061_13: THREE.Mesh; Cube061_14: THREE.Mesh; Cube061_15: THREE.Mesh;
    Cube061_16: THREE.Mesh; Cube061_17: THREE.Mesh;
  };
  materials: {
    ['Material.282']: THREE.MeshStandardMaterial; ['Material.283']: THREE.MeshStandardMaterial;
    ['Material.284']: THREE.MeshStandardMaterial; ['Material.285']: THREE.MeshStandardMaterial;
    ['Material.286']: THREE.MeshStandardMaterial; ['Material.287']: THREE.MeshStandardMaterial;
    ['Material.292']: THREE.MeshStandardMaterial; ['Material.293']: THREE.MeshStandardMaterial;
    ['Material.294']: THREE.MeshStandardMaterial; ['Material.295']: THREE.MeshStandardMaterial;
    ['Material.296']: THREE.MeshStandardMaterial; ['Material.297']: THREE.MeshStandardMaterial;
    ['Material.298']: THREE.MeshStandardMaterial; ['Material.299']: THREE.MeshStandardMaterial;
    ['Material.307']: THREE.MeshStandardMaterial; ['Material.308']: THREE.MeshStandardMaterial;
    ['Material.309']: THREE.MeshStandardMaterial; ['Material.321']: THREE.MeshStandardMaterial;
  };
};

export function SchoolJuniorInstances({ transforms, maxCount, ghost }: EducationInstancesProps) {
  const { nodes, materials } = useGLTF('/games/citybuilder/models/buildings/school-junior.glb') as unknown as SchoolJuniorGLTF;

  const meshes = useMemo(() => [
      { geometry: nodes.Cube061.geometry, material: materials['Material.282'] },
      { geometry: nodes.Cube061_1.geometry, material: materials['Material.283'] },
      { geometry: nodes.Cube061_2.geometry, material: materials['Material.284'] },
      { geometry: nodes.Cube061_3.geometry, material: materials['Material.285'] },
      { geometry: nodes.Cube061_4.geometry, material: materials['Material.286'] },
      { geometry: nodes.Cube061_5.geometry, material: materials['Material.287'] },
      { geometry: nodes.Cube061_6.geometry, material: materials['Material.292'] },
      { geometry: nodes.Cube061_7.geometry, material: materials['Material.293'] },
      { geometry: nodes.Cube061_8.geometry, material: materials['Material.294'] },
      { geometry: nodes.Cube061_9.geometry, material: materials['Material.295'] },
      { geometry: nodes.Cube061_10.geometry, material: materials['Material.296'] },
      { geometry: nodes.Cube061_11.geometry, material: materials['Material.297'] },
      { geometry: nodes.Cube061_12.geometry, material: materials['Material.298'] },
      { geometry: nodes.Cube061_13.geometry, material: materials['Material.299'] },
      { geometry: nodes.Cube061_14.geometry, material: materials['Material.307'] },
      { geometry: nodes.Cube061_15.geometry, material: materials['Material.308'] },
      { geometry: nodes.Cube061_16.geometry, material: materials['Material.309'] },
      { geometry: nodes.Cube061_17.geometry, material: materials['Material.321'] },
    ], [nodes, materials]);

  return (
    <InstancedGLTFGroup meshes={meshes} transforms={transforms} maxCount={maxCount} localOffset={[0, -0.002, 0]} ghost={ghost} />
  );
}
useGLTF.preload('/games/citybuilder/models/buildings/school-junior.glb');

// ---------- SchoolHigh ----------
type SchoolHighGLTF = GLTF & {
  nodes: {
    Cube063: THREE.Mesh; Cube063_1: THREE.Mesh; Cube063_2: THREE.Mesh; Cube063_3: THREE.Mesh;
    Cube063_4: THREE.Mesh; Cube063_5: THREE.Mesh; Cube063_6: THREE.Mesh; Cube063_7: THREE.Mesh;
    Cube063_8: THREE.Mesh; Cube063_9: THREE.Mesh; Cube063_10: THREE.Mesh; Cube063_11: THREE.Mesh;
    Cube063_12: THREE.Mesh; Cube063_13: THREE.Mesh; Cube063_14: THREE.Mesh; Cube063_15: THREE.Mesh;
  };
  materials: {
    ['Material.323']: THREE.MeshStandardMaterial; ['Material.324']: THREE.MeshStandardMaterial;
    ['Material.325']: THREE.MeshStandardMaterial; ['Material.326']: THREE.MeshStandardMaterial;
    ['Material.327']: THREE.MeshStandardMaterial; ['Material.288']: THREE.MeshStandardMaterial;
    ['Material.289']: THREE.MeshStandardMaterial; ['Material.290']: THREE.MeshStandardMaterial;
    ['Material.287']: THREE.MeshStandardMaterial; ['Material.291']: THREE.MeshStandardMaterial;
    ['Material.285']: THREE.MeshStandardMaterial; ['Material.286']: THREE.MeshStandardMaterial;
    ['Material.322']: THREE.MeshStandardMaterial; ['Material.317']: THREE.MeshStandardMaterial;
    ['Material.318']: THREE.MeshStandardMaterial; ['Material.319']: THREE.MeshStandardMaterial;
  };
};

export function SchoolHighInstances({ transforms, maxCount, ghost }: EducationInstancesProps) {
  const { nodes, materials } = useGLTF('/games/citybuilder/models/buildings/school-high.glb') as unknown as SchoolHighGLTF;

  const meshes = useMemo(() => [
    { geometry: nodes.Cube063.geometry, material: materials['Material.323'] },
    { geometry: nodes.Cube063_1.geometry, material: materials['Material.324'] },
    { geometry: nodes.Cube063_2.geometry, material: materials['Material.325'] },
    { geometry: nodes.Cube063_3.geometry, material: materials['Material.326'] },
    { geometry: nodes.Cube063_4.geometry, material: materials['Material.327'] },
    { geometry: nodes.Cube063_5.geometry, material: materials['Material.288'] },
    { geometry: nodes.Cube063_6.geometry, material: materials['Material.289'] },
    { geometry: nodes.Cube063_7.geometry, material: materials['Material.290'] },
    { geometry: nodes.Cube063_8.geometry, material: materials['Material.287'] },
    { geometry: nodes.Cube063_9.geometry, material: materials['Material.291'] },
    { geometry: nodes.Cube063_10.geometry, material: materials['Material.285'] },
    { geometry: nodes.Cube063_11.geometry, material: materials['Material.286'] },
    { geometry: nodes.Cube063_12.geometry, material: materials['Material.322'] },
    { geometry: nodes.Cube063_13.geometry, material: materials['Material.317'] },
    { geometry: nodes.Cube063_14.geometry, material: materials['Material.318'] },
    { geometry: nodes.Cube063_15.geometry, material: materials['Material.319'] },
  ], [nodes, materials]);

  // Offset lokal asli [0, -0.002, 0] — Z-nya nol, localOffset biasa cukup
  return (
    <InstancedGLTFGroup meshes={meshes} transforms={transforms} maxCount={maxCount} localOffset={[0, -0.002, 0]}ghost={ghost} />
  );
}
useGLTF.preload('/games/citybuilder/models/buildings/school-high.glb');