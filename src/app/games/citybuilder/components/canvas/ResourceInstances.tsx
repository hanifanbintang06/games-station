import * as THREE from 'three';
import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { GLTF } from 'three-stdlib';
import InstancedGLTFGroup, { InstanceTransform } from './InstancedGLTFGroup';

interface ResourceInstancesProps {
  transforms: InstanceTransform[];
  maxCount: number;
  ghost?: boolean;
}

// ---------- Water ----------
type WaterGLTF = GLTF & {
  nodes: {
    Cylinder008: THREE.Mesh; Cylinder008_1: THREE.Mesh; Cylinder008_2: THREE.Mesh;
    Cylinder008_3: THREE.Mesh; Cylinder008_4: THREE.Mesh; Cylinder008_5: THREE.Mesh;
  };
  materials: {
    ['Material.147']: THREE.MeshStandardMaterial; ['Material.148']: THREE.MeshStandardMaterial;
    ['Material.149']: THREE.MeshStandardMaterial; ['Material.150']: THREE.MeshStandardMaterial;
    ['Material.151']: THREE.MeshStandardMaterial; ['Material.152']: THREE.MeshStandardMaterial;
  };
};

// Matrix transform grup lokal asli: position [-1.135, 0.315, 0.418], rotation [PI/2, -PI/2, 0], scale 0.157
const buildWaterLocalMatrix = () => {
  const m = new THREE.Matrix4();
  const position = new THREE.Vector3(-1.135, 0.315, 0.418);
  const quaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, -Math.PI / 2, 0));
  const scale = new THREE.Vector3(0.157, 0.157, 0.157);
  m.compose(position, quaternion, scale);
  return m;
};

export function WaterInstances({ transforms, maxCount, ghost }: ResourceInstancesProps) {
  const { nodes, materials } = useGLTF('/games/citybuilder/models/buildings/water.glb') as unknown as WaterGLTF;

  // "Bakar" transform lokal (posisi+rotasi+skala) langsung ke geometry hasil clone,
  // sekali saja — supaya InstancedGLTFGroup cukup terima geometry yang sudah dalam posisi benar
  const meshes = useMemo(() => {
    const localMatrix = buildWaterLocalMatrix();
    const rawMeshes = [
      { geometry: nodes.Cylinder008.geometry, material: materials['Material.147'] },
      { geometry: nodes.Cylinder008_1.geometry, material: materials['Material.148'] },
      { geometry: nodes.Cylinder008_2.geometry, material: materials['Material.149'] },
      { geometry: nodes.Cylinder008_3.geometry, material: materials['Material.150'] },
      { geometry: nodes.Cylinder008_4.geometry, material: materials['Material.151'] },
      { geometry: nodes.Cylinder008_5.geometry, material: materials['Material.152'] },
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
useGLTF.preload('/games/citybuilder/models/buildings/water.glb');

// ---------- Electric ----------
type ElectricGLTF = GLTF & {
  nodes: { electric: THREE.Mesh };
  materials: { ['Material.146']: THREE.MeshStandardMaterial };
};

export function ElectricInstances({ transforms, maxCount, ghost }: ResourceInstancesProps) {
  const { nodes, materials } = useGLTF('/games/citybuilder/models/buildings/electric.glb') as unknown as ElectricGLTF;

  const meshes = useMemo(() => [
    { geometry: nodes.electric.geometry, material: materials['Material.146'] },
  ], [nodes, materials]);

  // Offset lokal cuma di Z (0.062), X dan Y nol — localOffset biasa cukup buat kasus ini
  return (
    <InstancedGLTFGroup meshes={meshes} transforms={transforms} maxCount={maxCount} localOffset={[0, 0, 0.062]} ghost={ghost} />
  );
}
useGLTF.preload('/games/citybuilder/models/buildings/electric.glb');

// ---------- Garbage (BARU) ----------
type GarbageGLTF = GLTF & {
  nodes: {
    Cube055: THREE.Mesh; Cube055_1: THREE.Mesh; Cube055_2: THREE.Mesh;
    Cube055_3: THREE.Mesh; Cube055_4: THREE.Mesh; Cube055_5: THREE.Mesh;
    Cube055_6: THREE.Mesh; Cube055_7: THREE.Mesh; Cube055_8: THREE.Mesh;
  };
  materials: {
    ['Material.186']: THREE.MeshStandardMaterial; ['Material.173']: THREE.MeshStandardMaterial;
    ['Material.171']: THREE.MeshStandardMaterial; ['Material.172']: THREE.MeshStandardMaterial;
    ['Material.183']: THREE.MeshStandardMaterial; ['Material.170']: THREE.MeshStandardMaterial;
    ['Material.184']: THREE.MeshStandardMaterial; ['Material.169']: THREE.MeshStandardMaterial;
    ['Material.006']: THREE.MeshStandardMaterial;
  };
};

export function GarbageInstances({ transforms, maxCount, ghost }: ResourceInstancesProps) {
  const { nodes, materials } = useGLTF('/games/citybuilder/models/buildings/garbage.glb') as unknown as GarbageGLTF;

  const meshes = useMemo(() => [
    { geometry: nodes.Cube055.geometry, material: materials['Material.186'] },
    { geometry: nodes.Cube055_1.geometry, material: materials['Material.173'] },
    { geometry: nodes.Cube055_2.geometry, material: materials['Material.171'] },
    { geometry: nodes.Cube055_3.geometry, material: materials['Material.172'] },
    { geometry: nodes.Cube055_4.geometry, material: materials['Material.183'] },
    { geometry: nodes.Cube055_5.geometry, material: materials['Material.170'] },
    { geometry: nodes.Cube055_6.geometry, material: materials['Material.184'] },
    { geometry: nodes.Cube055_7.geometry, material: materials['Material.169'] },
    { geometry: nodes.Cube055_8.geometry, material: materials['Material.006'] },
  ], [nodes, materials]);

  // ASUMSI: belum ada matrix transform lokal (posisi/rotasi/skala asli Blender) seperti Water.
  // Kalau modelnya nongol miring/offset dari pusat ubin, tambahkan buildXxxLocalMatrix() seperti Water
  // dan pakai .clone().applyMatrix4(matrix) di sini.
  return (
    <InstancedGLTFGroup meshes={meshes} transforms={transforms} maxCount={maxCount} localOffset={[0, 0, 0]} ghost={ghost} />
  );
}
useGLTF.preload('/games/citybuilder/models/buildings/garbage.glb');