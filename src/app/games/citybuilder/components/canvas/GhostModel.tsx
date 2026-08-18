import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface GhostModelProps {
  children: React.ReactNode;
  opacity?: number;
}

export default function GhostModel({ children, opacity = 0.5 }: GhostModelProps) {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    const originalMaterials: { mesh: THREE.Mesh; material: THREE.Material | THREE.Material[] }[] = [];

    group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        originalMaterials.push({ mesh: child, material: child.material });

        const cloneAsGhost = (mat: THREE.Material) => {
          const cloned = mat.clone();
          cloned.transparent = true;
          cloned.opacity = opacity;
          cloned.depthWrite = false;
          return cloned;
        };

        child.material = Array.isArray(child.material)
          ? child.material.map(cloneAsGhost)
          : cloneAsGhost(child.material);
      }
    });

    // Kembalikan material asli saat ghost dilepas, biar nggak bocor ke instance lain
    return () => {
      originalMaterials.forEach(({ mesh, material }) => {
        mesh.material = material;
      });
    };
  }, [opacity]);

  return <group ref={groupRef}>{children}</group>;
}