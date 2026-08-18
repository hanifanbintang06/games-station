import { TILE_SIZE } from '../../core/constants';

interface HighlightBoxProps {
  start: { x: number; z: number };
  end: { x: number; z: number };
  color: string;
}

export default function HighlightBox({ start, end, color }: HighlightBoxProps) {
  const minX = Math.min(start.x, end.x);
  const maxX = Math.max(start.x, end.x);
  const minZ = Math.min(start.z, end.z);
  const maxZ = Math.max(start.z, end.z);

  const width = (maxX - minX + 1) * TILE_SIZE;
  const depth = (maxZ - minZ + 1) * TILE_SIZE;

  // Menghitung titik tengah untuk penempatan bidang
  const posX = (minX * TILE_SIZE) + (width / 2);
  const posZ = (minZ * TILE_SIZE) + (depth / 2);

  return (
    <mesh position={[posX, 0.05, posZ]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[width, depth]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} depthWrite={false} />
    </mesh>
  );
}