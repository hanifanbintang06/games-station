import * as THREE from 'three';
import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { GLTF } from 'three-stdlib';
import InstancedGLTFGroup, { InstanceTransform } from './InstancedGLTFGroup';

interface RoadInstancesProps {
  transforms: InstanceTransform[];
  maxCount: number;
  ghost?: boolean;
}

// ---------- RoadStraight ----------
type RoadStraightGLTF = GLTF & {
  nodes: {
    Cube035: THREE.Mesh; Cube035_1: THREE.Mesh; Cube035_2: THREE.Mesh;
    Cube035_3: THREE.Mesh; Cube035_4: THREE.Mesh;
  };
  materials: {
    ['Material.092']: THREE.MeshStandardMaterial; ['Material.091']: THREE.MeshStandardMaterial;
    ['Material.090']: THREE.MeshStandardMaterial; ['Material.089']: THREE.MeshStandardMaterial;
    ['Material.088']: THREE.MeshStandardMaterial;
  };
};

export function RoadStraightInstances({ transforms, maxCount, ghost }: RoadInstancesProps) {
  const { nodes, materials } = useGLTF('/games/citybuilder/models/roads/road1.glb') as unknown as RoadStraightGLTF;

  const meshes = useMemo(() => [
    { geometry: nodes.Cube035.geometry, material: materials['Material.092'] },
    { geometry: nodes.Cube035_1.geometry, material: materials['Material.091'] },
    { geometry: nodes.Cube035_2.geometry, material: materials['Material.090'] },
    { geometry: nodes.Cube035_3.geometry, material: materials['Material.089'] },
    { geometry: nodes.Cube035_4.geometry, material: materials['Material.088'] },
  ], [nodes, materials]);

  return (
    <InstancedGLTFGroup meshes={meshes} transforms={transforms} maxCount={maxCount} localOffset={[0, 0.5, 0]} ghost={ghost} />
  );
}
useGLTF.preload('/games/citybuilder/models/roads/road1.glb');

// ---------- RoadCorner ----------
type RoadCornerGLTF = GLTF & {
  nodes: {
    Cube034: THREE.Mesh; Cube034_1: THREE.Mesh; Cube034_2: THREE.Mesh; Cube034_3: THREE.Mesh;
  };
  materials: {
    ['Material.087']: THREE.MeshStandardMaterial; ['Material.086']: THREE.MeshStandardMaterial;
    ['Material.084']: THREE.MeshStandardMaterial; ['Material.085']: THREE.MeshStandardMaterial;
  };
};

export function RoadCornerInstances({ transforms, maxCount, ghost }: RoadInstancesProps) {
  const { nodes, materials } = useGLTF('/games/citybuilder/models/roads/road2.glb') as unknown as RoadCornerGLTF;

  const meshes = useMemo(() => [
    { geometry: nodes.Cube034.geometry, material: materials['Material.087'] },
    { geometry: nodes.Cube034_1.geometry, material: materials['Material.086'] },
    { geometry: nodes.Cube034_2.geometry, material: materials['Material.084'] },
    { geometry: nodes.Cube034_3.geometry, material: materials['Material.085'] },
  ], [nodes, materials]);

  return (
    <InstancedGLTFGroup meshes={meshes} transforms={transforms} maxCount={maxCount} localOffset={[0, 0, 0]} ghost={ghost} />
  );
}
useGLTF.preload('/games/citybuilder/models/roads/road2.glb');

// ---------- RoadTee ----------
type RoadTeeGLTF = GLTF & {
  nodes: {
    Cube036: THREE.Mesh; Cube036_1: THREE.Mesh; Cube036_2: THREE.Mesh; Cube036_3: THREE.Mesh;
  };
  materials: {
    ['Material.093']: THREE.MeshStandardMaterial; ['Material.094']: THREE.MeshStandardMaterial;
    ['Material.095']: THREE.MeshStandardMaterial; ['Material.096']: THREE.MeshStandardMaterial;
  };
};

export function RoadTeeInstances({ transforms, maxCount, ghost }: RoadInstancesProps) {
  const { nodes, materials } = useGLTF('/games/citybuilder/models/roads/road3.glb') as unknown as RoadTeeGLTF;

  const meshes = useMemo(() => [
    { geometry: nodes.Cube036.geometry, material: materials['Material.093'] },
    { geometry: nodes.Cube036_1.geometry, material: materials['Material.094'] },
    { geometry: nodes.Cube036_2.geometry, material: materials['Material.095'] },
    { geometry: nodes.Cube036_3.geometry, material: materials['Material.096'] },
  ], [nodes, materials]);

  return (
    <InstancedGLTFGroup meshes={meshes} transforms={transforms} maxCount={maxCount} localOffset={[0, 0, 0]} ghost={ghost} />
  );
}
useGLTF.preload('/games/citybuilder/models/roads/road3.glb');

// ---------- RoadCrossroad ----------
type RoadCrossroadGLTF = GLTF & {
  nodes: {
    Cube037: THREE.Mesh; Cube037_1: THREE.Mesh; Cube037_2: THREE.Mesh; Cube037_3: THREE.Mesh;
  };
  materials: {
    ['Material.097']: THREE.MeshStandardMaterial; ['Material.098']: THREE.MeshStandardMaterial;
    ['Material.099']: THREE.MeshStandardMaterial; ['Material.100']: THREE.MeshStandardMaterial;
  };
};

export function RoadCrossroadInstances({ transforms, maxCount, ghost }: RoadInstancesProps) {
  const { nodes, materials } = useGLTF('/games/citybuilder/models/roads/road4.glb') as unknown as RoadCrossroadGLTF;

  const meshes = useMemo(() => [
    { geometry: nodes.Cube037.geometry, material: materials['Material.097'] },
    { geometry: nodes.Cube037_1.geometry, material: materials['Material.098'] },
    { geometry: nodes.Cube037_2.geometry, material: materials['Material.099'] },
    { geometry: nodes.Cube037_3.geometry, material: materials['Material.100'] },
  ], [nodes, materials]);

  return (
    <InstancedGLTFGroup meshes={meshes} transforms={transforms} maxCount={maxCount} localOffset={[0, 0, 0]} ghost={ghost} />
  );
}
useGLTF.preload('/games/citybuilder/models/roads/road4.glb');