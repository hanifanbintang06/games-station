import * as THREE from 'three';
import { Lane, Side, sideAnchorLocal, oppositeSide, evalQuadraticBezier, evalQuadraticBezierTangent } from './laneSystem';

export type RouteSegment =
  | { type: 'straight'; from: THREE.Vector3; to: THREE.Vector3 }
  | { type: 'lane'; lane: Lane };

interface Tile { x: number; z: number }

const key = (t: Tile) => `${t.x},${t.z}`;

function sideFacing(from: Tile, to: Tile): Side {
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  if (dx === 1) return 'E';
  if (dx === -1) return 'W';
  if (dz === 1) return 'S';
  return 'N';
}

function findAdjacentRoadTile(building: Tile, roadSet: Set<string>): Tile | null {
  const neighbors: Tile[] = [
    { x: building.x + 1, z: building.z },
    { x: building.x - 1, z: building.z },
    { x: building.x, z: building.z + 1 },
    { x: building.x, z: building.z - 1 },
  ];
  return neighbors.find((n) => roadSet.has(key(n))) || null;
}

function findRoadPath(start: Tile, end: Tile, roadSet: Set<string>): Tile[] | null {
  if (start.x === end.x && start.z === end.z) return [start];

  const visited = new Set([key(start)]);
  const queue: Tile[] = [start];
  const prev = new Map<string, Tile>();

  while (queue.length > 0) {
    const cur = queue.shift()!;
    if (cur.x === end.x && cur.z === end.z) {
      const path = [cur];
      let k = key(cur);
      while (prev.has(k)) {
        const p = prev.get(k)!;
        path.unshift(p);
        k = key(p);
      }
      return path;
    }

    const neighbors: Tile[] = [
      { x: cur.x + 1, z: cur.z }, { x: cur.x - 1, z: cur.z },
      { x: cur.x, z: cur.z + 1 }, { x: cur.x, z: cur.z - 1 },
    ];

    for (const n of neighbors) {
      const nk = key(n);
      if (visited.has(nk) || !roadSet.has(nk)) continue;
      visited.add(nk);
      prev.set(nk, cur);
      queue.push(n);
    }
  }
  return null;
}

function tileCenter(t: Tile, tileSize: number): THREE.Vector3 {
  const half = tileSize / 2;
  return new THREE.Vector3(t.x * tileSize + half, 0, t.z * tileSize + half);
}

function anchorPoint(roadTile: Tile, building: Tile, tileSize: number): THREE.Vector3 {
  const half = tileSize / 2;
  const side = sideFacing(roadTile, building);
  const local = sideAnchorLocal(side, half);
  return new THREE.Vector3(roadTile.x * tileSize + half + local.x, 0, roadTile.z * tileSize + half + local.z);
}

// STOP_RATIO: seberapa jauh mobil maju dari tengah tile menuju tepi rumah.
// 1.0 = mepet ke tepi (perilaku lama, kepanjangan buat mobil besar).
// 0.5 = berhenti di tengah-tengah antara pusat tile dan tepi rumah — beri buffer
// supaya badan mobil yang panjang (kayak fire truck) gak nembus ke tile rumah.
const STOP_RATIO = 0.5;

function buildSyntheticLane(
  tile: Tile,
  fromSide: Side,
  toSide: Side,
  tileSize: number,
  stopRatio: number = 1
): Lane {
  const half = tileSize / 2;
  const centerX = tile.x * tileSize + half;
  const centerZ = tile.z * tileSize + half;

  const a = sideAnchorLocal(fromSide, half);
  const bFull = sideAnchorLocal(toSide, half);
  // Skala titik akhir ke arah pusat tile sesuai stopRatio, bukan langsung ke tepi penuh
  const b = { x: bFull.x * stopRatio, z: bFull.z * stopRatio };

  const p0 = new THREE.Vector3(centerX + a.x, 0, centerZ + a.z);
  const p2 = new THREE.Vector3(centerX + b.x, 0, centerZ + b.z);
  const control = new THREE.Vector3(centerX, 0, centerZ);
  const approxLength = Math.max(p0.distanceTo(control) + control.distanceTo(p2), 0.001);

  return { p0, control, p2, fromSide, toSide, approxLength };
}

// BARU: Segmen akhir berupa garis LURUS searah masuk tile (bukan melengkung ke rumah).
// Mobil melanjutkan arah datangnya, berhenti di titik stopRatio*half melewati pusat tile.
// Ini menjamin mobil TETAP di garis jalan, tidak pernah bergeser lateral ke arah rumah.
function buildFinalApproachSegment(
  tile: Tile,
  fromSide: Side,
  tileSize: number,
  stopRatio: number
): RouteSegment {
  const half = tileSize / 2;
  const centerX = tile.x * tileSize + half;
  const centerZ = tile.z * tileSize + half;

  const a = sideAnchorLocal(fromSide, half); // titik masuk (di tepi tile)
  const from = new THREE.Vector3(centerX + a.x, 0, centerZ + a.z);

  // Arah jalan = dari titik masuk menuju pusat tile (lanjutkan garis lurus itu)
  const dirX = -a.x;
  const dirZ = -a.z;
  const len = Math.sqrt(dirX * dirX + dirZ * dirZ) || 1;
  const ux = dirX / len;
  const uz = dirZ / len;

  const to = new THREE.Vector3(
    centerX + ux * (half * stopRatio),
    0,
    centerZ + uz * (half * stopRatio)
  );

  return { type: 'straight', from, to };
}

export function buildDispatchRoute(
  stationBuilding: Tile,
  targetBuilding: Tile,
  roadTiles: Tile[],
  laneCache: Map<string, Lane[]>,
  tileSize: number
): RouteSegment[] | null {
  const roadSet = new Set(roadTiles.map(key));

  const stationRoad = findAdjacentRoadTile(stationBuilding, roadSet);
  const targetRoad = findAdjacentRoadTile(targetBuilding, roadSet);
  if (!stationRoad || !targetRoad) return null;

  const path = findRoadPath(stationRoad, targetRoad, roadSet);
  if (!path) return null;

  const segments: RouteSegment[] = [];

  segments.push({ type: 'straight', from: tileCenter(stationBuilding, tileSize), to: anchorPoint(path[0], stationBuilding, tileSize) });

  
  const STOP_RATIO = 0.5; // seberapa jauh melewati pusat tile sebelum berhenti

    for (let i = 0; i < path.length; i++) {
    const tile = path[i];
    const isLastTile = i === path.length - 1;
    const prevPoint = i === 0 ? stationBuilding : path[i - 1];
    const nextPoint = isLastTile ? targetBuilding : path[i + 1];

    const fromSide = oppositeSide(sideFacing(prevPoint, tile));
    const toSide = sideFacing(tile, nextPoint);

    if (fromSide === toSide) continue;

    if (isLastTile) {
        // Lurus, gak melengkung ke arah rumah -> mobil tetap di garis jalan
        segments.push(buildFinalApproachSegment(tile, fromSide, tileSize, STOP_RATIO));
    } else {
        const lanes = laneCache.get(key(tile)) || [];
        const lane = lanes.find((l) => l.fromSide === fromSide && l.toSide === toSide);

        if (lane) {
        segments.push({ type: 'lane', lane });
        } else {
        segments.push({ type: 'lane', lane: buildSyntheticLane(tile, fromSide, toSide, tileSize) });
        }
    }
    }

  // Tidak perlu segmen tambahan lagi — lane sintetis di atas SUDAH berakhir tepat
  // di anchorPoint (tepi jalan menghadap rumah), jadi mobil otomatis berhenti di situ.

  return segments;
}

export { evalQuadraticBezier, evalQuadraticBezierTangent };