import { BuildTool } from '../page';

export interface CityLevelConfig {
  level: number;
  label: string;
  minPopulation: number;
  unlocks: BuildTool[];
  unlockLabel: string;   // deskripsi buat ditampilkan di tab Level
  implemented: boolean;  // false = belum digarap, selalu "Segera Hadir"
}

export const CITY_LEVELS: CityLevelConfig[] = [
  { level: 1, label: 'Level 1', minPopulation: 0, unlocks: [], unlockLabel: 'Level awal kota.', implemented: true },
  {
    level: 2,
    label: 'Level 2',
    minPopulation: 400,
    unlocks: ['SERVICE_HOSPITAL', 'SERVICE_POLICE', 'SERVICE_FIREFIGHTER'],
    unlockLabel: 'Membuka semua bangunan Layanan: Rumah Sakit, Polisi, Pemadam.',
    implemented: true,
  },
  { level: 3, label: 'Level 3', minPopulation: 0, unlocks: [], unlockLabel: 'Segera hadir.', implemented: false },
  { level: 4, label: 'Level 4', minPopulation: 0, unlocks: [], unlockLabel: 'Segera hadir.', implemented: false },
];

export function getUnlockedTools(population: number): BuildTool[] {
  return CITY_LEVELS.filter((l) => l.implemented && population >= l.minPopulation).flatMap((l) => l.unlocks);
}