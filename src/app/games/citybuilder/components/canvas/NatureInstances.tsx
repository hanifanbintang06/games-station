import * as THREE from 'three';
import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { GLTF } from 'three-stdlib';
import InstancedGLTFGroup, { InstanceTransform } from './InstancedGLTFGroup';

interface NatureInstancesProps {
  transforms: InstanceTransform[];
  maxCount: number;
  ghost?: boolean;
}

// ---------- Tree1 ----------
type Tree1GLTF = GLTF & {
  nodes: {
    Cube051: THREE.Mesh; Cube051_1: THREE.Mesh; Cube051_2: THREE.Mesh; Cube051_3: THREE.Mesh;
    Cube051_4: THREE.Mesh; Cube051_5: THREE.Mesh; Cube051_6: THREE.Mesh; Cube051_7: THREE.Mesh;
    Cube051_8: THREE.Mesh; Cube051_9: THREE.Mesh; Cube051_10: THREE.Mesh;
  };
  materials: {
    ['Material.187']: THREE.MeshStandardMaterial; ['Material.185']: THREE.MeshStandardMaterial;
    ['Material.188']: THREE.MeshStandardMaterial; ['Material.189']: THREE.MeshStandardMaterial;
    ['Material.190']: THREE.MeshStandardMaterial; ['Material.191']: THREE.MeshStandardMaterial;
    ['Material.192']: THREE.MeshStandardMaterial; ['Material.193']: THREE.MeshStandardMaterial;
    ['Material.194']: THREE.MeshStandardMaterial; ['Material.195']: THREE.MeshStandardMaterial;
    ['Material.196']: THREE.MeshStandardMaterial;
  };
};

export function Tree1Instances({ transforms, maxCount, ghost }: NatureInstancesProps) {
  const { nodes, materials } = useGLTF('/games/citybuilder/models/natures/tree1.glb') as unknown as Tree1GLTF;

  const meshes = useMemo(() => [
    { geometry: nodes.Cube051.geometry, material: materials['Material.187'] },
    { geometry: nodes.Cube051_1.geometry, material: materials['Material.185'] },
    { geometry: nodes.Cube051_2.geometry, material: materials['Material.188'] },
    { geometry: nodes.Cube051_3.geometry, material: materials['Material.189'] },
    { geometry: nodes.Cube051_4.geometry, material: materials['Material.190'] },
    { geometry: nodes.Cube051_5.geometry, material: materials['Material.191'] },
    { geometry: nodes.Cube051_6.geometry, material: materials['Material.192'] },
    { geometry: nodes.Cube051_7.geometry, material: materials['Material.193'] },
    { geometry: nodes.Cube051_8.geometry, material: materials['Material.194'] },
    { geometry: nodes.Cube051_9.geometry, material: materials['Material.195'] },
    { geometry: nodes.Cube051_10.geometry, material: materials['Material.196'] },
  ], [nodes, materials]);

  return (
    <InstancedGLTFGroup meshes={meshes} transforms={transforms} maxCount={maxCount} localOffset={[0.037, -0.024, -0.022]} ghost={ghost} />
  );
}
useGLTF.preload('/games/citybuilder/models/natures/tree1.glb');

// ---------- Tree2 ----------
type Tree2GLTF = GLTF & {
  nodes: {
    Cube054: THREE.Mesh; Cube054_1: THREE.Mesh; Cube054_2: THREE.Mesh; Cube054_3: THREE.Mesh;
    Cube054_4: THREE.Mesh; Cube054_5: THREE.Mesh; Cube054_6: THREE.Mesh; Cube054_7: THREE.Mesh;
    Cube054_8: THREE.Mesh; Cube054_9: THREE.Mesh; Cube054_10: THREE.Mesh; Cube054_11: THREE.Mesh;
    Cube054_12: THREE.Mesh; Cube054_13: THREE.Mesh; Cube054_14: THREE.Mesh; Cube054_15: THREE.Mesh;
    Cube054_16: THREE.Mesh; Cube054_17: THREE.Mesh; Cube054_18: THREE.Mesh; Cube054_19: THREE.Mesh;
    Cube054_20: THREE.Mesh; Cube054_21: THREE.Mesh; Cube054_22: THREE.Mesh; Cube054_23: THREE.Mesh;
    Cube054_24: THREE.Mesh;
  };
  materials: {
    ['Material.209']: THREE.MeshStandardMaterial; ['Material.210']: THREE.MeshStandardMaterial;
    ['Material.211']: THREE.MeshStandardMaterial; ['Material.212']: THREE.MeshStandardMaterial;
    ['Material.213']: THREE.MeshStandardMaterial; ['Material.214']: THREE.MeshStandardMaterial;
    ['Material.215']: THREE.MeshStandardMaterial; ['Material.216']: THREE.MeshStandardMaterial;
    ['Material.201']: THREE.MeshStandardMaterial; ['Material.202']: THREE.MeshStandardMaterial;
    ['Material.203']: THREE.MeshStandardMaterial; ['Material.204']: THREE.MeshStandardMaterial;
    ['Material.205']: THREE.MeshStandardMaterial; ['Material.206']: THREE.MeshStandardMaterial;
    ['Material.207']: THREE.MeshStandardMaterial; ['Material.208']: THREE.MeshStandardMaterial;
    ['Material.235']: THREE.MeshStandardMaterial; ['Material.234']: THREE.MeshStandardMaterial;
    ['Material.233']: THREE.MeshStandardMaterial; ['Material.241']: THREE.MeshStandardMaterial;
    ['Material.240']: THREE.MeshStandardMaterial; ['Material.239']: THREE.MeshStandardMaterial;
    ['Material.238']: THREE.MeshStandardMaterial; ['Material.237']: THREE.MeshStandardMaterial;
    ['Material.236']: THREE.MeshStandardMaterial;
  };
};

// Grup lokal Tree2 punya rotasi, jadi harus dibakar ke geometry (bukan localOffset biasa)
const buildTree2LocalMatrix = () => {
  const m = new THREE.Matrix4();
  const position = new THREE.Vector3(-0.649, 0.498, -0.698);
  const quaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI, 0.8, -Math.PI));
  const scale = new THREE.Vector3(1, 1, 1);
  m.compose(position, quaternion, scale);
  return m;
};

export function Tree2Instances({ transforms, maxCount, ghost }: NatureInstancesProps) {
  const { nodes, materials } = useGLTF('/games/citybuilder/models/natures/tree2.glb') as unknown as Tree2GLTF;

  const meshes = useMemo(() => {
    const localMatrix = buildTree2LocalMatrix();
    const rawMeshes = [
      { geometry: nodes.Cube054.geometry, material: materials['Material.209'] },
      { geometry: nodes.Cube054_1.geometry, material: materials['Material.210'] },
      { geometry: nodes.Cube054_2.geometry, material: materials['Material.211'] },
      { geometry: nodes.Cube054_3.geometry, material: materials['Material.212'] },
      { geometry: nodes.Cube054_4.geometry, material: materials['Material.213'] },
      { geometry: nodes.Cube054_5.geometry, material: materials['Material.214'] },
      { geometry: nodes.Cube054_6.geometry, material: materials['Material.215'] },
      { geometry: nodes.Cube054_7.geometry, material: materials['Material.216'] },
      { geometry: nodes.Cube054_8.geometry, material: materials['Material.201'] },
      { geometry: nodes.Cube054_9.geometry, material: materials['Material.202'] },
      { geometry: nodes.Cube054_10.geometry, material: materials['Material.203'] },
      { geometry: nodes.Cube054_11.geometry, material: materials['Material.204'] },
      { geometry: nodes.Cube054_12.geometry, material: materials['Material.205'] },
      { geometry: nodes.Cube054_13.geometry, material: materials['Material.206'] },
      { geometry: nodes.Cube054_14.geometry, material: materials['Material.207'] },
      { geometry: nodes.Cube054_15.geometry, material: materials['Material.208'] },
      { geometry: nodes.Cube054_16.geometry, material: materials['Material.235'] },
      { geometry: nodes.Cube054_17.geometry, material: materials['Material.234'] },
      { geometry: nodes.Cube054_18.geometry, material: materials['Material.233'] },
      { geometry: nodes.Cube054_19.geometry, material: materials['Material.241'] },
      { geometry: nodes.Cube054_20.geometry, material: materials['Material.240'] },
      { geometry: nodes.Cube054_21.geometry, material: materials['Material.239'] },
      { geometry: nodes.Cube054_22.geometry, material: materials['Material.238'] },
      { geometry: nodes.Cube054_23.geometry, material: materials['Material.237'] },
      { geometry: nodes.Cube054_24.geometry, material: materials['Material.236'] },
    ];

    return rawMeshes.map(({ geometry, material }) => ({
      geometry: geometry.clone().applyMatrix4(localMatrix),
      material,
    }));
  }, [nodes, materials]);

  return (
    <InstancedGLTFGroup meshes={meshes} transforms={transforms} maxCount={maxCount} localOffset={[0, 0, 0]} ghost={ghost} />
  );
}
useGLTF.preload('/games/citybuilder/models/natures/tree2.glb');

// ---------- Fountain ----------
type FountainGLTF = GLTF & {
  nodes: { Cylinder014: THREE.Mesh; Cylinder014_1: THREE.Mesh };
  materials: { ['Material.200']: THREE.MeshStandardMaterial; ['Material.199']: THREE.MeshStandardMaterial };
};

export function FountainInstances({ transforms, maxCount, ghost }: NatureInstancesProps) {
  const { nodes, materials } = useGLTF('/games/citybuilder/models/natures/fauntain.glb') as unknown as FountainGLTF;

  const meshes = useMemo(() => [
    { geometry: nodes.Cylinder014.geometry, material: materials['Material.200'] },
    { geometry: nodes.Cylinder014_1.geometry, material: materials['Material.199'] },
  ], [nodes, materials]);

  return (
    <InstancedGLTFGroup meshes={meshes} transforms={transforms} maxCount={maxCount} localOffset={[0.042, -0.002, -0.233]} ghost={ghost} />
  );
}
useGLTF.preload('/games/citybuilder/models/natures/fauntain.glb');