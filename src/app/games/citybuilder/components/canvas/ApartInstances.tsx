import * as THREE from 'three';
import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { GLTF } from 'three-stdlib';
import InstancedGLTFGroup, { InstanceTransform } from './InstancedGLTFGroup';

interface ApartInstancesProps {
  transforms: InstanceTransform[];
  maxCount: number;
  ghost?: boolean;
}

// ---------- Apart1 ----------
type Apart1GLTF = GLTF & {
  nodes: {
    Cube064: THREE.Mesh; Cube064_1: THREE.Mesh; Cube064_2: THREE.Mesh; Cube064_3: THREE.Mesh;
    Cube064_4: THREE.Mesh; Cube064_5: THREE.Mesh; Cube064_6: THREE.Mesh;
  };
  materials: {
    ['Material.333']: THREE.MeshStandardMaterial; ['Material.320']: THREE.MeshStandardMaterial;
    ['Material.328']: THREE.MeshStandardMaterial; ['Material.329']: THREE.MeshStandardMaterial;
    ['Material.330']: THREE.MeshStandardMaterial; ['Material.331']: THREE.MeshStandardMaterial;
    ['Material.332']: THREE.MeshStandardMaterial;
  };
};

export function Apart1Instances({ transforms, maxCount, ghost }: ApartInstancesProps) {
  const { nodes, materials } = useGLTF('/games/citybuilder/models/buildings/apart1.glb') as unknown as Apart1GLTF;

  const meshes = useMemo(() => [
    { geometry: nodes.Cube064.geometry, material: materials['Material.333'] },
    { geometry: nodes.Cube064_1.geometry, material: materials['Material.320'] },
    { geometry: nodes.Cube064_2.geometry, material: materials['Material.328'] },
    { geometry: nodes.Cube064_3.geometry, material: materials['Material.329'] },
    { geometry: nodes.Cube064_4.geometry, material: materials['Material.330'] },
    { geometry: nodes.Cube064_5.geometry, material: materials['Material.331'] },
    { geometry: nodes.Cube064_6.geometry, material: materials['Material.332'] },
  ], [nodes, materials]);

  return <InstancedGLTFGroup meshes={meshes} transforms={transforms} maxCount={maxCount} localOffset={[0, 0, 0]} ghost={ghost} />;
}
useGLTF.preload('/games/citybuilder/models/buildings/apart1.glb');

// ---------- Apart2 ----------
type Apart2GLTF = GLTF & {
  nodes: {
    Cube066: THREE.Mesh; Cube066_1: THREE.Mesh; Cube066_2: THREE.Mesh; Cube066_3: THREE.Mesh;
    Cube066_4: THREE.Mesh; Cube066_5: THREE.Mesh; Cube066_6: THREE.Mesh;
  };
  materials: {
    ['Material.334']: THREE.MeshStandardMaterial; ['Material.335']: THREE.MeshStandardMaterial;
    ['Material.336']: THREE.MeshStandardMaterial; ['Material.337']: THREE.MeshStandardMaterial;
    ['Material.338']: THREE.MeshStandardMaterial; ['Material.339']: THREE.MeshStandardMaterial;
    ['Material.012']: THREE.MeshStandardMaterial;
  };
};

export function Apart2Instances({ transforms, maxCount, ghost }: ApartInstancesProps) {
  const { nodes, materials } = useGLTF('/games/citybuilder/models/buildings/apart2.glb') as unknown as Apart2GLTF;

  const meshes = useMemo(() => [
    { geometry: nodes.Cube066.geometry, material: materials['Material.334'] },
    { geometry: nodes.Cube066_1.geometry, material: materials['Material.335'] },
    { geometry: nodes.Cube066_2.geometry, material: materials['Material.336'] },
    { geometry: nodes.Cube066_3.geometry, material: materials['Material.337'] },
    { geometry: nodes.Cube066_4.geometry, material: materials['Material.338'] },
    { geometry: nodes.Cube066_5.geometry, material: materials['Material.339'] },
    { geometry: nodes.Cube066_6.geometry, material: materials['Material.012'] },
  ], [nodes, materials]);

  return <InstancedGLTFGroup meshes={meshes} transforms={transforms} maxCount={maxCount} localOffset={[0, 0, 0]} ghost={ghost} />;
}
useGLTF.preload('/games/citybuilder/models/buildings/apart2.glb');

// ---------- Apart3 ----------
type Apart3GLTF = GLTF & {
  nodes: {
    Cube069: THREE.Mesh; Cube069_1: THREE.Mesh; Cube069_2: THREE.Mesh; Cube069_3: THREE.Mesh;
    Cube069_4: THREE.Mesh; Cube069_5: THREE.Mesh; Cube069_6: THREE.Mesh;
  };
  materials: {
    ['Material.347']: THREE.MeshStandardMaterial; ['Material.348']: THREE.MeshStandardMaterial;
    ['Material.349']: THREE.MeshStandardMaterial; ['Material.350']: THREE.MeshStandardMaterial;
    ['Material.351']: THREE.MeshStandardMaterial; ['Material.353']: THREE.MeshStandardMaterial;
    ['Material.356']: THREE.MeshStandardMaterial;
  };
};

export function Apart3Instances({ transforms, maxCount, ghost }: ApartInstancesProps) {
  const { nodes, materials } = useGLTF('/games/citybuilder/models/buildings/apart3.glb') as unknown as Apart3GLTF;

  const meshes = useMemo(() => [
    { geometry: nodes.Cube069.geometry, material: materials['Material.347'] },
    { geometry: nodes.Cube069_1.geometry, material: materials['Material.348'] },
    { geometry: nodes.Cube069_2.geometry, material: materials['Material.349'] },
    { geometry: nodes.Cube069_3.geometry, material: materials['Material.350'] },
    { geometry: nodes.Cube069_4.geometry, material: materials['Material.351'] },
    { geometry: nodes.Cube069_5.geometry, material: materials['Material.353'] },
    { geometry: nodes.Cube069_6.geometry, material: materials['Material.356'] },
  ], [nodes, materials]);

  return <InstancedGLTFGroup meshes={meshes} transforms={transforms} maxCount={maxCount} localOffset={[0, 0, 0]} ghost={ghost} />;
}
useGLTF.preload('/games/citybuilder/models/buildings/apart3.glb');

// ---------- Apart4 ----------
type Apart4GLTF = GLTF & {
  nodes: {
    Cube062: THREE.Mesh; Cube062_1: THREE.Mesh; Cube062_2: THREE.Mesh; Cube062_3: THREE.Mesh;
    Cube062_4: THREE.Mesh; Cube062_5: THREE.Mesh; Cube062_6: THREE.Mesh; Cube062_7: THREE.Mesh;
  };
  materials: {
    ['Material.340']: THREE.MeshStandardMaterial; ['Material.341']: THREE.MeshStandardMaterial;
    ['Material.342']: THREE.MeshStandardMaterial; ['Material.343']: THREE.MeshStandardMaterial;
    ['Material.344']: THREE.MeshStandardMaterial; ['Material.345']: THREE.MeshStandardMaterial;
    ['Material.346']: THREE.MeshStandardMaterial; ['Material.355']: THREE.MeshStandardMaterial;
  };
};

export function Apart4Instances({ transforms, maxCount, ghost }: ApartInstancesProps) {
  const { nodes, materials } = useGLTF('/games/citybuilder/models/buildings/apart4.glb') as unknown as Apart4GLTF;

  const meshes = useMemo(() => [
    { geometry: nodes.Cube062.geometry, material: materials['Material.340'] },
    { geometry: nodes.Cube062_1.geometry, material: materials['Material.341'] },
    { geometry: nodes.Cube062_2.geometry, material: materials['Material.342'] },
    { geometry: nodes.Cube062_3.geometry, material: materials['Material.343'] },
    { geometry: nodes.Cube062_4.geometry, material: materials['Material.344'] },
    { geometry: nodes.Cube062_5.geometry, material: materials['Material.345'] },
    { geometry: nodes.Cube062_6.geometry, material: materials['Material.346'] },
    { geometry: nodes.Cube062_7.geometry, material: materials['Material.355'] },
  ], [nodes, materials]);

  return <InstancedGLTFGroup meshes={meshes} transforms={transforms} maxCount={maxCount} localOffset={[0, 0, 0]} ghost={ghost} />;
}
useGLTF.preload('/games/citybuilder/models/buildings/apart4.glb');