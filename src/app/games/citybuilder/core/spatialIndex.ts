import { PlacedItem } from '../components/canvas/GridSystem';

const CELL_SIZE = 8; // ukuran sel grid spasial, disesuaikan dengan radius terbesar yang dipakai (12)
export const MAX_WARNING_RADIUS = 12; // radius terbesar yang dipakai di getBuildingWarning

export interface SpatialIndex {
  byCoord: Map<string, PlacedItem>; // lookup O(1) untuk tetangga langsung (cek jalan)
  grid: Map<string, PlacedItem[]>;  // bucket per sel untuk query radius
}

export function buildSpatialIndex(items: PlacedItem[]): SpatialIndex {
  const byCoord = new Map<string, PlacedItem>();
  const grid = new Map<string, PlacedItem[]>();

  items.forEach((item) => {
    if (!item.isSecondary) {
      byCoord.set(`${item.x},${item.z}`, item);
    }

    const cellX = Math.floor(item.x / CELL_SIZE);
    const cellZ = Math.floor(item.z / CELL_SIZE);
    const key = `${cellX},${cellZ}`;
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key)!.push(item);
  });

  return { byCoord, grid };
}

// Cek apakah ada tile ROAD tepat bersebelahan (atas/bawah/kiri/kanan) dari koordinat tertentu
export function hasAdjacentRoad(index: SpatialIndex, x: number, z: number): boolean {
  return (
    index.byCoord.get(`${x},${z - 1}`)?.type === 'ROAD' ||
    index.byCoord.get(`${x},${z + 1}`)?.type === 'ROAD' ||
    index.byCoord.get(`${x - 1},${z}`)?.type === 'ROAD' ||
    index.byCoord.get(`${x + 1},${z}`)?.type === 'ROAD'
  );
}

// Cek apakah ADA minimal satu item yang memenuhi predikat dalam radius tertentu
export function queryRadiusSome(
  index: SpatialIndex,
  x: number,
  z: number,
  radius: number,
  predicate: (item: PlacedItem) => boolean
): boolean {
  const cellRadius = Math.ceil(radius / CELL_SIZE) + 1;
  const centerCellX = Math.floor(x / CELL_SIZE);
  const centerCellZ = Math.floor(z / CELL_SIZE);

  for (let cx = centerCellX - cellRadius; cx <= centerCellX + cellRadius; cx++) {
    for (let cz = centerCellZ - cellRadius; cz <= centerCellZ + cellRadius; cz++) {
      const bucket = index.grid.get(`${cx},${cz}`);
      if (!bucket) continue;

      for (const item of bucket) {
        if (!predicate(item)) continue;
        const dist = Math.sqrt((item.x - x) ** 2 + (item.z - z) ** 2);
        if (dist <= radius) return true;
      }
    }
  }
  return false;
}

// Hitung jumlah item yang memenuhi predikat dalam radius, berhenti dini di 'cap' (efisiensi,
// karena kode kita cuma butuh tau 0 / 1 / >=2, nggak perlu hitung pasti sampai ratusan)
export function queryRadiusCount(
  index: SpatialIndex,
  x: number,
  z: number,
  radius: number,
  predicate: (item: PlacedItem) => boolean,
  cap: number = Infinity
): number {
  const cellRadius = Math.ceil(radius / CELL_SIZE) + 1;
  const centerCellX = Math.floor(x / CELL_SIZE);
  const centerCellZ = Math.floor(z / CELL_SIZE);
  let count = 0;

  for (let cx = centerCellX - cellRadius; cx <= centerCellX + cellRadius; cx++) {
    for (let cz = centerCellZ - cellRadius; cz <= centerCellZ + cellRadius; cz++) {
      const bucket = index.grid.get(`${cx},${cz}`);
      if (!bucket) continue;

      for (const item of bucket) {
        if (!predicate(item)) continue;
        const dist = Math.sqrt((item.x - x) ** 2 + (item.z - z) ** 2);
        if (dist <= radius) {
          count++;
          if (count >= cap) return count;
        }
      }
    }
  }
  return count;
}

// Kumpulkan bangunan (non-secondary) yang berada dalam radius pengaruh dari titik-titik yang berubah
// (dipakai untuk dirty-tracking: cuma bangunan ini yang perlu di-recompute warning-nya)
export function findAffectedItems(
  allItems: PlacedItem[],
  changedCoords: { x: number; z: number }[],
  radius: number = MAX_WARNING_RADIUS
): Set<PlacedItem> {
  const affected = new Set<PlacedItem>();

  allItems.forEach((item) => {
    if (item.isSecondary) return;
    const isAffected = changedCoords.some((c) => {
      const dist = Math.sqrt((item.x - c.x) ** 2 + (item.z - c.z) ** 2);
      return dist <= radius;
    });
    if (isAffected) affected.add(item);
  });

  return affected;
}