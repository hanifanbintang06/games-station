import * as THREE from 'three';

export type Side = 'N' | 'E' | 'S' | 'W';

export interface Lane {
  p0: THREE.Vector3;
  control: THREE.Vector3;
  p2: THREE.Vector3;
  fromSide: Side;
  toSide: Side;
  approxLength: number;
}

export const sideAnchorLocal = (side: Side, half: number) => {
  switch (side) {
    case 'N': return { x: 0, z: -half };
    case 'S': return { x: 0, z: half };
    case 'E': return { x: half, z: 0 };
    case 'W': return { x: -half, z: 0 };
  }
};

const isOppositePair = (a: Side, b: Side) =>
  (a === 'N' && b === 'S') || (a === 'S' && b === 'N') ||
  (a === 'E' && b === 'W') || (a === 'W' && b === 'E');

// Bangun semua kemungkinan jalur (lane) dari tiap tile jalan, berdasarkan sisi mana yang
// terbuka (openSides). Tile dengan cuma 1 sisi terbuka (dead-end) dilewati — mobil akan
// despawn & respawn di tempat lain kalau ketemu dead-end.
export function buildLaneCache(
  roadItems: { x: number; z: number; openSides?: Side[] }[],
  tileSize: number
): Map<string, Lane[]> {
  const cache = new Map<string, Lane[]>();
  const half = tileSize / 2;

  roadItems.forEach((item) => {
    const sides = item.openSides;
    if (!sides || sides.length < 2) return;

    const centerX = item.x * tileSize + half;
    const centerZ = item.z * tileSize + half;
    const lanes: Lane[] = [];

    for (const from of sides) {
      for (const to of sides) {
        if (from === to) continue;

        const a = sideAnchorLocal(from, half);
        const b = sideAnchorLocal(to, half);

        // Untuk sisi berlawanan (lurus): titik kontrol di tengah -> hasil garis lurus.
        // Untuk sisi bersebelahan (belokan): titik kontrol di sudut tile -> hasil kurva melengkung.
        const controlLocal = { x: 0, z: 0 };

        const p0 = new THREE.Vector3(centerX + a.x, 0, centerZ + a.z);
        const p2 = new THREE.Vector3(centerX + b.x, 0, centerZ + b.z);
        const control = new THREE.Vector3(centerX + controlLocal.x, 0, centerZ + controlLocal.z);
        const approxLength = Math.max(p0.distanceTo(control) + control.distanceTo(p2), 0.001);

        lanes.push({ p0, control, p2, fromSide: from, toSide: to, approxLength });
      }
    }

    cache.set(`${item.x},${item.z}`, lanes);
  });

  return cache;
}

export function evalQuadraticBezier(lane: Lane, t: number, out: THREE.Vector3) {
  const u = 1 - t;
  out.set(
    u * u * lane.p0.x + 2 * u * t * lane.control.x + t * t * lane.p2.x,
    0,
    u * u * lane.p0.z + 2 * u * t * lane.control.z + t * t * lane.p2.z
  );
  return out;
}

export function evalQuadraticBezierTangent(lane: Lane, t: number, out: THREE.Vector3) {
  const u = 1 - t;
  out.set(
    2 * u * (lane.control.x - lane.p0.x) + 2 * t * (lane.p2.x - lane.control.x),
    0,
    2 * u * (lane.control.z - lane.p0.z) + 2 * t * (lane.p2.z - lane.control.z)
  );
  return out;
}

export function neighborFromSide(x: number, z: number, side: Side) {
  switch (side) {
    case 'N': return { x, z: z - 1 };
    case 'S': return { x, z: z + 1 };
    case 'E': return { x: x + 1, z };
    case 'W': return { x: x - 1, z };
  }
}

export const oppositeSide = (side: Side): Side =>
  side === 'N' ? 'S' : side === 'S' ? 'N' : side === 'E' ? 'W' : 'E';