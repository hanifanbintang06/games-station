import { BuildTool } from '../page';

export const BUILD_COSTS: Record<BuildTool, number> = {
  ROAD: 100,
  ZONE_HOUSE_L1: 1000,
  ZONE_HOUSE_L2: 800,
  ZONE_COMMERCIAL_L1: 3000,
  ZONE_COMMERCIAL_L2: 12000, 
  ZONE_INDUSTRIAL_L1: 15000,
  RESOURCE_ELECTRIC: 5000,
  RESOURCE_WATER: 5000,
  RESOURCE_GARBAGE: 6000,
  NATURE_TREE1: 500,
  NATURE_TREE2: 500,
  NATURE_FOUNTAIN: 4000,
  SERVICE_HOSPITAL: 400000,
  SERVICE_POLICE: 600000,
  SERVICE_FIREFIGHTER: 600000,
  EDUCATION_ELEMENTARY: 10000,
  EDUCATION_JUNIOR: 15000, // asumsi, sesuaikan
  EDUCATION_HIGH: 20000,   // asumsi, sesuaikan
};

// BARU: Daftar tool yang footprint-nya tetap (2x2, dst) — klik = taruh langsung, nggak lewat drag.
// Nambah bangunan 2x2/3x3 baru: cukup masukkan BuildTool-nya ke sini + BUILD_COSTS di atas.
export const FIXED_2X2_TOOLS: BuildTool[] = ['EDUCATION_ELEMENTARY', 'EDUCATION_JUNIOR', 'EDUCATION_HIGH', 'ZONE_COMMERCIAL_L2'];